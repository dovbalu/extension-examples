/* See license.txt for terms of usage */

define([
    "firebug/lib/object",
    "firebug/lib/trace",
    "firebug/lib/domplate",
],
function(Obj, FBTrace, Domplate) {

// ********************************************************************************************* //
// Custom Panel Implementation

var panelName = "helloamd";

function MyPanel() {}
MyPanel.prototype = Obj.extend(Firebug.Panel,
{
    name: panelName,
    title: "Hello AMD World!",

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
    // Initialization

    initialize: function()
    {
        Firebug.Panel.initialize.apply(this, arguments);

        if (FBTrace.DBG_HELLOAMD)
            FBTrace.sysout("helloAMD; MyPanel.initialize");

        // TODO: Panel initialization (there is one panel instance per browser tab)

        this.refresh();
    },

    destroy: function(state)
    {
        if (FBTrace.DBG_HELLOAMD)
            FBTrace.sysout("helloAMD; MyPanel.destroy");

        Firebug.Panel.destroy.apply(this, arguments);
    },

    show: function(state)
    {
        Firebug.Panel.show.apply(this, arguments);

        if (FBTrace.DBG_HELLOAMD)
            FBTrace.sysout("helloAMD; MyPanel.show");
    },

    refresh: function()
    {
        // Render panel content. The HTML result of the template corresponds to: 
        //this.panelNode.innerHTML = "<span>" + Locale.$STR("helloamd.panel.label") + "</span>";
        this.MyTemplate.render(this.panelNode);

        // TODO: Render panel content
    }
});

// ********************************************************************************************* //
// Panel UI (Domplate)

// Register locales before the following template definition.
Firebug.registerStringBundle("chrome://helloamd/locale/helloamd.properties");

var {domplate, SPAN} = Domplate;

/**
 * Domplate template used to render panel's content. Note that the template uses
 * localized strings and so, Firebug.registerStringBundle for the appropriate
 * locale file must be already executed at this moment.
 */
MyPanel.prototype.MyTemplate = domplate(
{
    tag:
        SPAN(
            FBL.$STR("helloamd.panel.label")
        ),

    render: function(parentNode)
    {
        this.tag.replace({}, parentNode);
    }
});

// ********************************************************************************************* //
// Registration

Firebug.registerPanel(MyPanel);
Firebug.registerStylesheet("resource://helloamd/skin/classic/helloamd.css");

if (FBTrace.DBG_HELLOAMD)
    FBTrace.sysout("helloAMD; myPanel.js, stylesheet registered");

return MyPanel;

// ********************************************************************************************* //
});
