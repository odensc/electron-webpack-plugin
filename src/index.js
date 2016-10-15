import electron from "electron";
import proc from "child_process";
import {resolve} from "path";

export default class ElectronPlugin
{
	constructor(options)
	{
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
		this.options.options.stdio = this.options.options.stdio || "inherit";
	}

	launch(cb)
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
		cb();
	}

	apply(compiler)
	{
		// when we get a compilation
		compiler.plugin("compilation", compilation => {
			// when a module is built
			compilation.plugin("succeed-module", module => {
				// if it is in relaunch path
				if (module.request
					&& resolve(module.request).indexOf(this.options.relaunchPathMatch) > -1)
				{
					// we should relaunch after emit
					this.shouldRelaunch = true;
				}
			});
		});

		// when files are emitted
		compiler.plugin("after-emit", (compilation, cb) => {
			if (this.shouldRelaunch) this.launch(cb);
		});
	}
}
