/* zk.js

	Purpose:
		
	Description:
		
	History:
		Mon Sep 29 17:17:26 2008, Created by tomyeh

Copyright (C) 2008 Potix Corporation. All Rights Reserved.

This program is distributed under GPL Version 2.0 in the hope that
it will be useful, but WITHOUT ANY WARRANTY.
*/
//zk//
zk = { //static members
	/** The ZK version. */
	//version: '5.0.0',
	/** The ZK build number. */
	//build: '0',
	/** The processing prompt delay. */
	//procDelay: 0,
	/** The tooltip delay. */
	//tipDelay: 0,
	/** The resend delay. */
	//resendDelay: 0,
	/** # of JS files being loaded. */
	loading: 0,

	/** Whether ZK is creating a new page. */
	//creating: 0,
	/** Whether ZK has created at least one page. */
	//booted: 0,
	/** Whether ZK is processing something (such as creating, doing AU). */
	//processing: 0,
	/** The DOM element that gains the focus. */
	//currentFocus: null,

	/** Declares a package.
	 * It is similar to Java's package statement.
	 * <p>Example:
	 * <pre><code>
	 * _ = zk.package('com.foo');
	 * _.Cool = zk.extends(zk.Object);
	 * </code></pre>
	 * @param name the package name (a String object).
	 */
	$package: function (name) {
		for (var j = 0, ref = window;;) {
			var k = name.indexOf('.', j),
				nm = k >= 0 ? name.substring(j, k): name.substring(j);
			var nxt = ref[nm];
			if (!nxt) nxt = ref[nm] = {};
			if (k < 0) return nxt;
			ref = nxt;
			j = k + 1;
		}
	},
	/** Imports a package or a class.
	 * <p>Example:
	 * <pre><code>
	 * var foo = zk.import('com.foo');
	 * var cool = new foo.Cool();
	 * var Cool = zk.import('com.foo.Cooler');
	 * var cooler = new Cooler();
	 * </code></pre>
	 * @param name the package name (a String object).
	 * @return the package or class being imported, or null if not found
	 */
	$import: function (name) {
		for (var j = 0, ref = window;;) {
			var k = name.indexOf('.', j),
				nm = k >= 0 ? name.substring(j, k): name.substring(j);
			var nxt = ref[nm];
			if (k < 0 || !nxt) return nxt;
			ref = nxt;
			j = k + 1;
		}
	},

	/** Declares a class that extendss the specified base class.
	 * @param superclass the super class.
	 * @param members the non-static members
	 * @param staticMembers the static members.
	 */
	$extends: function (superclass, members, staticMembers) {
	//Note: we cannot use extends due to IE and Safari
		var jclass = function() {
			this.$init.apply(this, arguments);
		};

		var thisprototype = jclass.prototype,
			superprototype = superclass.prototype;
		zk.copy(thisprototype, superprototype); //inherit non-static
		zk.copy(thisprototype, members);

		for (var p in superclass) //inherit static methods only
			if (p != 'prototype') {
				var v = superclass[p];
				if (typeof v == 'function')
					jclass[p] = v;
			}
		zk.copy(jclass, staticMembers);

		thisprototype.$class = jclass;
		thisprototype._$super = superprototype;
		jclass.superclass = superclass;
		return jclass;
	},
	/** Provides the default values for the specified optios.
	 * @param opts the options (a map) (could be null)
	 * @param defaults the default values (a map) (cannot be null)
	 */
	$default: function (opts, defaults) {
		opts = opts || {};
		for (var p in defaults)
			if (opts[p] == null)
				opts[p] = defaults[p];
		return opts;
	},
	/** Copies the values from one map to anther.
	 */
	copy: function (dst, src) {
		if (!dst) dst = {};
		for (var p in src)
			dst[p] = src[p];
		return dst;
	},

	/** A does-nothing function. */
	$void: function() {
		return '';
	},
	/** An abstract function, i.e., a function of an interface.
	 * It always throws an exception when called.
	 */
	$abstract: function () {
		throw "abstract method";
	},

	/** Parse a string to an integer. */
	parseInt: function (v, b) {
		v = v ? parseInt(v, b || 10): 0;
		return isNaN(v) ? 0: v;
	},
	/** Tests if the character is 0, 1, ... or 9. */
	isDigit: function (c) {
		return c >= '0' && c <= '9';
	},
	/** Returns whether a character is a white space. */
	isWhitespace: function (cc) {
		return cc == ' ' || cc == '\t' || cc == '\n' || cc == '\r';
	},

	/** Assigns a value to the specified property, or assigns
	 * a map of properties.
	 * If setX is defined (assumes name is x), <code>o.setX(value)</code> is called.
	 * If not defined, <code>o[name] = value</code> is called.
	 * <p>Example,<code>zk.set(o, 'value', 12)</code><br/>
	 * <code>zk.set(o, {value: 12, type: 'jet'});</code>
	 */
	set: function (o, name, value) {
		if (arguments.length == 2) {
			for (var p in name)
				zk._set(o, p, name[p]);
			return;
		}
		zk._set(o, name, value);
	},
	_set: function (o, name, value) {
		var m = o['set' + name.charAt(0).toUpperCase() + name.substring(1)];
		if (m) m.call(o, value);
		else o[name] = value;
	},
	/** Retrieves a value from the specified property.
	 * If getX or isX is defined (assume name is x), <code>o.isX()</code>
	 * or <code>o.getX()</code> is returned.
	 * If not defined, <code>o[name]</code> is returned.
	 */
	get: function (o, name) {
		var nm = name.charAt(0).toUpperCase() + name.substring(1);
			m = o['get' + nm];
		if (m) return m.call(o);
		m = o['is' + nm];
		if (m) return m.call(o);
		return o[name];
	},

	//Processing//
	/** Set a flag, zk.processing, that it starts an processing.
	 * It also shows a message to indicate "processing" after the specified timeout.
	 */
	startProcessing: function (timeout) {
		zk.processing = true;
		if (timeout > 0) setTimeout(zk._showproc, timeout);
		else zk._showproc();
	},
	/** Clear a flag, zk.processing, to indicate the processing is done.
	 * It also removes the message indicating "processing".
	 */
	endProcessing: function() {
		zk.processing = false;
		zUtl.cleanAllProgress("zk_proc");
	},
	/** Shows the message of zk.startProcessing. */
	_showproc: function () {
		if (zk.processing && !zk.loading) {
			if (zDom.$("zk_proc") || zDom.$("zk_showBusy"))
				return;

			var msg;
			try {msg = mesg.PLEASE_WAIT;} catch (e) {msg = "Processing...";}
				//when the first boot, mesg might not be ready
			zUtl.progressbox("zk_proc", msg, !zk.booted);
		}
	},

	//status

	//DEBUG//
	/** Generates an error message. */
	error: function (msg) {
		if (!zk.booted) {
			setTimeout(function () {zk.error(msg)}, 100);
			return;
		}

		if (!zk._errcnt) zk._errcnt = 1;
		var id = "zk_err" + zk._errcnt++,
			x = (zk._errcnt * 5) % 50, y = (zk._errcnt * 5) % 50,
			box = document.createElement("DIV");
		document.body.appendChild(box);
		var html =
	 '<div class="z-error" style="left:'+(zDom.innerX()+x)+'px;top:'+(zDom.innerY()+y)
	+'px;" id="'+id+'"><table cellpadding="2" cellspacing="2" width="100%"><tr>'
	+'<td align="right"><div id="'+id
	+'$p"><a href="javascript:zAu.sendRedraw()">redraw</a>&nbsp;'
	+'<a href="javascript:zDom.remove(\''+id+'\')">close</a></div></td></tr>'
	+'<tr valign="top"><td class="z-error-msg">'+zUtl.encodeXML(msg, true) //Bug 1463668: security
	+'</td></tr></table></div>';
		box = zDom.setOuterHTML(box, html);

		try {
			new zk.Draggable(null, box, {
				handle: zDom.$(id+'$p'), zIndex: box.style.zIndex,
				starteffect: zk.$void, starteffect: zk.$void,
				endeffect: zk.$void});
		} catch (e) {
		}
	},
	/** Closes all error box (zk.error).
	 */
	errorDismiss: function () {
		for (var j = zk._errcnt; j; --j)
			zDom.remove("zk_err" + j);
	},
	/** Generates a message for debugging purpose. */
	debug: function (vararg) {
		var ars = arguments, msg = '';
		for (var j = 0, len = ars.length; j < len; j++) {
			if (msg) msg += ", ";
			msg += ars[j];
		}

		zk._msg = (zk._msg ? zk._msg + msg: msg) + '\n';
		setTimeout(zk._debug0, 600);
	},
	_debug0: function () {
		if (zk._msg) {
			var console = zDom.$("zk_dbg");
			if (!console) {
				console = document.createElement("DIV");
				document.body.appendChild(console);
				var html =
	'<div id="zk_dbgbox" class="z-debug">'
	+'<button onclick="zDom.remove(\'zk_dbgbox\')">X</button><br/>'
	+'<textarea id="zk_dbg" rows="10"></textarea></div>';
				zDom.setOuterHTML(console, html);
				console = zDom.$("zk_dbg");
			}
			console.value += zk._msg;
			console.scrollTop = console.scrollHeight;
			zk._msg = null;
		}
	}
};

//String//
zk.copy(String.prototype, {
	startsWith: function (prefix) {
		return this.substring(0,prefix.length) == prefix;
	},
	endsWith: function (suffix) {
		return this.substring(this.length-suffix.length) == suffix;
	},
	trim: function () {
		var j = 0, tl = this.length, k = tl - 1;
		while (j < tl && this.charAt(j) <= ' ')
			++j;
		while (k >= j && this.charAt(k) <= ' ')
			--k;
		return j > k ? "": this.substring(j, k + 1);
	},
	/** onverts a string separated by dashes into a camelCase equivalent.
	 * For instance, 'foo-bar' would be converted to 'fooBar'.
	 */
	$camel: function() {
		var parts = this.split('-'), len = parts.length;
		if (len == 1) return parts[0];

		var camelized = this.charAt(0) == '-' ?
			parts[0].charAt(0).toUpperCase() + parts[0].substring(1): parts[0];

		for (var i = 1; i < len; i++)
			camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
		return camelized;
	},
	/** Increase a value to the first character of the string, and
	 * return the increased string.
	 * For example, 'a'.$inc(2) is 'c' (same as 'a' + 2 in Java)
	 */
	$inc: function (diff) {
		return String.fromCharCode(this.charCodeAt(0) + diff)
	},
	/** Returns the difference of the character's values (charCodeAt).
	 * For instance, 'a'.$sub('b') is -1 (same as 'a' - 'b' in Java).
	 */
	$sub: function (cc) {
		return this.charCodeAt(0) - cc.charCodeAt(0);
	}
});

//Array//
zk.copy(Array.prototype, {
	/** Removes the specified object from the array if any.
	 * Returns false if not found.
	 */
	$remove: function (o) {
		for (var j = 0, tl = this.length; j < tl; ++j) {
			if (o == this[j]) {
				this.splice(j, 1);
				return true;
			}
		}
		return false;
	},
	/** Returns whether the array contains the specified object.
	 * @return true if it was removed successfully
	 */
	$contains: function (o) {
		for (var j = 0, tl = this.length; j < tl; ++j) {
			if (o == this[j])
				return true;
		}
		return false;
	},
	/** Adds the specified object to the end of the array.
	 * @param fn the function to test whether to add the object to.
	 * If omitted, the object is appended (aka., push).
	 * If a function, fn(o, ary[j]) is called from the first location
	 * to the last, and the object is
	 * inserted in front of the location that the function returns true.
	 * If fn is true, it overwrites if the object is already in the array.
	 * The object is appended if no matches at all.
	 * @return true if added successfully.
	 */
	$add: function (o, fn) {
		if (fn) {
			for (var tl = this.length, j = 0; j < tl; ++j) {
				if (fn == true) {
					if (o == this[j]) {
						this[j] = o;
						return false;
					}
				} else if (fn(o, this[j])) {
					this.splice(j, 0, o);
					return true;
				}
			}
		}
 		this.push(o);
 		return true;
	},
	/** Inserts at the specified location.
	 */
	$addAt: function (j, o) {
		var l = this.length;
		if (j >= l) this.push(o);
		else this.splice(j, 0, o);
	},
	/** Removes at the specified location.
	 * @return true if it was removed successfully
	 */
	$removeAt: function (j) {
		if (j < this.length) {
			this.splice(j, 1);
			return true;
		}
		return false;
	},
	/** Clones this array. */
	$clone: function() {
		return [].concat(this);
	}
});

zk.agent = navigator.userAgent.toLowerCase();
zk.safari = zk.agent.indexOf("safari") >= 0;
zk.opera = zk.agent.indexOf("opera") >= 0;
zk.gecko = zk.agent.indexOf("gecko/") >= 0 && !zk.safari && !zk.opera;
if (zk.gecko) {
	var j = zk.agent.indexOf("firefox/");
	j = zk.parseInt(zk.agent.substring(j + 8));
	zk.gecko3 = j >= 3;
	zk.gecko2Only = !zk.gecko3;
} else if (!zk.opera) {
	var j = zk.agent.indexOf("msie ");
	zk.ie = j >= 0;
	if (zk.ie) {
		j = zk.parseInt(zk.agent.substring(j + 5));
		zk.ie7 = j >= 7; //ie7 or later
		zk.ie8 = j >= 8; //ie8 or later
		zk.ie6Only = !zk.ie7;
	}
}
zk.air = zk.agent.indexOf("adobeair") >= 0;

//Object//
/** The Object class that all other classes are extended from. */
zk.Object = function () {};
zk.Object.prototype = {
	$init: zk.$void,
	/** The class of this object belongs to. */
	$class: zk.Object,
	/** Determines if this object is an instance of the specified class. */
	$instanceof: function (cls) {
		if (cls)
			for (var c = this.$class; c; c = c.superclass)
				if (c == cls)
					return true;
		return false;
	},
	/** Calls a method in the super class.
	 * @param mtdnm the method name
	 * @see #$supers
	 */
	$super: function (mtdnm, vararg) {
		var args = [];
		for (var j = arguments.length; --j > 0;)
			args.unshift(arguments[j]);
		return this.$supers(mtdnm, args);
	},
	/** Calls a method in the super class with an array of arguments.
	 * It is like Function's apply() that takes an array of arguments.
	 * @see #$super
	 */
	$supers: function (mtdnm, args) {
		var supers = this._$supers;
		if (!supers) supers = this._$supers = {};

		//locate the method
		var old = supers[mtdnm], m, p, oldmtd;
		if (old) {
			oldmtd = old[mtdnm];
			p = old;
		} else {
			oldmtd = this[mtdnm];
			p = this;
		}
		for (;;) {
			if (!(p = p._$super))
				throw mtdnm + " not in superclass";
			if (oldmtd != p[mtdnm]) {
				m = p[mtdnm];
				if (m) supers[mtdnm] = p;
				break;
			}
		}

		try {
			return m.apply(this, args);
		} finally {
			supers[mtdnm] = old; //restore
		}
	},

	/** Proxies a member function such that it can be called without
	 * <code>this</code>.
	 * @param f a member of this object
	 * @return a function that can be called not in the context
	 * of this object (i.e., without <code>this</code>)
	 */
	proxy: function (f) {
		var o = this;
		return function () {
			return f.apply(o, arguments);
		};
	}
};
/** Determines if the specified object is an instance of this class. */
zk.Object.isInstance = function (o) {
	return o && o.$instanceof && o.$instanceof(this);
};
/** Determines if this class is a super class of the specified class. */
zk.Object.isAssignableFrom = function (cls) {
	for (; cls; cls = cls.superclass)
		if (this == cls)
			return true;
	return false;
};
