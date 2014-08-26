/* See license.txt for terms of usage */
/* jshint esnext: true */
/* global require: true, exports: true, Services: true, dump: true */

"use strict";

const { Cu } = require("chrome");

var TraceAPI = ["dump", "sysout", "setScope", "matchesNode", "time", "timeEnd"];

// TODO Externalise this constant.
const PREF_DOMAIN = "extensions.firebug";

var FBTrace = {
  sysout: function(msg, object) {
    console.log(msg, object);
  }
};

try {
  var scope = {};
  Cu["import"]("resource://fbtrace/firebug-trace-service.js", scope);
  FBTrace = scope.traceConsoleService.getTracer(PREF_DOMAIN);
}
catch(err) {
}

Cu["import"]("resource://gre/modules/Services.jsm");

/**
 * Support for scoped logging.
 *
 * @deprecated Use FBTrace.get(module.id); instead
 *
 * // The log will be displayed only if DBG_MYMODULE option is on. 
 * // 'DBG_MYMODULE' preference will be automatically created and appear in the
 * // FBTrace console (after restart).
 * FBTrace = FBTrace.to("DBG_MYMODULE");
 * FBTrace.sysout("mymodule.initialiaze");
 */
FBTrace.to = function(option) {
  // Automatically create corresponding DBG_ + <option> preference so, it 
  // appears in the FBTrace Console window and can be checked on/off
  // Note that FBTrace Console is already initialized and do not refresh if a 
  // new pref is created. So, the option appears after restart.
  // xxxHonza: FIX ME
  var prefName = PREF_DOMAIN + "." + option;
  var value;

  try {
    value = Services.prefs.getBoolPref(prefName);
  }
  catch(ex) {}

  if (typeof(value) != "boolean") {
      value = false;
      Services.prefs.setBoolPref(prefName, value);
  }

  return new TraceWrapper(this, option);
};

/**
 * Return the appropriate Trace object. The log will appear in the
 * Trace Console only if the module is selected in the Option tab.
 *
 * @param {string} moduleId The id of the module (just pass module.id).
 *
 * @return {object} The object containing Trace and TraceError
 *
 * @example
 *   const {Trace, TraceError} = require("lib/trace").get(module.id);
 */
FBTrace.get = function(moduleId) {
  // xxxFlorent: code to remove once the Option panel has been improved.
  var result = { TraceError: TraceError };
  var dbgOption = ("DBG_" + moduleId.substr("firebug-next/".length))
    .toUpperCase();

  result.Trace = FBTrace.to(dbgOption);
  return result;
};

var TraceError = FBTrace.to("DBG_ERRORS");

/**
 * Wraps tracer for given option. Logs made through the wrapper will 
 * automatically be checked against the option and only displayed if the option
 * is true.
 * If FBTrace console isn't installed all options are false and there is no
 * additional performance penalty.
 */
function TraceWrapper(tracer, option)
{
    function createMethodWrapper(method)
    {
        return function()
        {
            // Check the option before the log is passed to the tracing console.
            if (tracer[option])
                tracer[method].apply(tracer, arguments);
        };
    }

    for (var i=0; i<TraceAPI.length; i++)
    {
        var method = TraceAPI[i];
        this[method] = createMethodWrapper(method);
    }

    /**
     * Use to check whether scoped tracer is on/off.
     */
    this.__defineGetter__("active", function()
    {
        return tracer[option];
    });
}


exports.Trace = FBTrace;
exports.FBTrace = FBTrace;
exports.TraceError = TraceError;
exports.get = FBTrace.get;
