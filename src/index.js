import electron from "electron";
import proc from "child_process";
import {resolve} from "path";

export default class ElectronPlugin
{
	constructor(options)
	{
		this.hashIndex = {};
		// default to empty object
		this.options = options || {};
		// make sure relaunchPathMatch was given
		if (!this.options.relaunchPathMatch)
		{
			throw new Error("webpack-electron-plugin: relaunchPathMatch is required");
		}

		// make sure path was given
		if (!this.options.path)
		{
			throw new Error("webpack-electron-plugin: path is required");
		}

		// resolve to absolute path
		this.options.relaunchPathMatch = resolve(this.options.relaunchPathMatch);
		this.options.path = resolve(this.options.path);
		// defaults
		this.options.args = this.options.args || [];
		this.options.options = this.options.options || {};
		this.options.options.cwd = this.options.options.cwd || this.options.path;
		this.options.options.stdio = this.options.options.stdio || "inherit";
	}

	launch()
	{
		// if electron is open, kill
		if (this.child)
		{
			this.child.kill();
			this.child = null;
		}

		this.child = proc.spawn(
			electron,
			this.options.args.concat(this.options.path),
			this.options.options
		);
	}

	apply(compiler)
	{
		// when compilation is done
		compiler.plugin("done", stats => {
			let shouldRelaunch = false;
			stats.compilation.modules.every(module => {
				if (!module.resource) return true;

				// resolve absolute path
				const path = resolve(module.resource);
				// get hash
				const hash = module._cachedSource.hash;
				// if in relaunch path and hash is different
				if (path.indexOf(this.options.relaunchPathMatch) > -1
					&& this.hashIndex[path] !== hash)
				{
					shouldRelaunch = true;
				}

				// update hash in index
				this.hashIndex[path] = hash;
				// keep going, or stop
				return !shouldRelaunch;
			});

			if (shouldRelaunch) this.launch();
		});
	}
}
