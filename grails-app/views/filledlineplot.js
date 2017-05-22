//<!DOCTYPE html>
//<html>
//hello
//<head>
//<meta charset="utf-8">
//    <meta name="viewport" content="width=device-width, initial-scale=1">
//    <link href="//fonts.googleapis.com/css?family=Raleway:400,300,600" rel="stylesheet" type="text/css">
//    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.css"/>
//
//        <!-- Necessary includes for LocusZoom.js -->
//    <script src="../locuszoom.vendor.min.js" type="text/javascript"></script>
//    <script src="../locuszoom.app.js" type="text/javascript"></script>
//    <link rel="stylesheet" href="../locuszoom.css" type="text/css"/>
//
//    <title>LocusZoom.js ~ Filled line plot Example</title>
//
//<style>
//body {
//    background-color: #FAFAFA;
//    margin: 0px 20px;
//}
//img {
//    max-width: 100%;
//    box-sizing: border-box;
//}
//</style>
//
//</head>
//
//<body style="background-color: #FAFAFA; margin-left: 20px; margin-right: 20px;">
//    <div class="container">
//
//    <h1 style="margin-top: 1em;"><strong>LocusZoom.js</strong></h1>
//
//<h3 style="float: left; color: #777">LocusZoom.js ~ Filled line plot Example</h3>
//<h6 style="float: right;"><a href="../index.html">&lt; return home</a></h6>
//
//<hr style="clear: both;">
//
//    <p>This is filled line plot experiment</p>
//
//<div class="row">
//    <div class="two columns">
//
//    <style>ul.top_hits li { margin-bottom: 0rem; }</style>
//<ul class="top_hits" style="padding-left: 0.2rem; min-width: 110px;"></ul>
//    </div>
//    <div class="ten columns">
//    <div id="plot" data-region="10:114550452-115067678"></div>
//    </div>
//    </div>
//
//    <hr>
//
//    <div class="row">
//    <footer style="text-align: center;">
//    &copy; Copyright 2016 <a href="https://github.com/statgen">The University of Michigan Center for Statistical Genetics</a><br>
//</footer>
//</div>
//
//</div>
//
//<script type="text/javascript">
//
//// Define base data sources
//var apiBase = "https://portaldev.sph.umich.edu/api/v1/";
//var data_sources = new LocusZoom.DataSources()
//    .add("recomb", ["RecombLZ", { url: apiBase + "annotation/recomb/results/", params: {source: 15} }])
//    .add("gene", ["GeneLZ", { url: apiBase + "annotation/genes/", params: {source: 2} }])
//    .add("constraint", ["GeneConstraintLZ", { url: "http://exac.broadinstitute.org/api/constraint" }]);
//
//// Build the base layout
//var association_panel_mods = {
//    data_layers: [
//        LocusZoom.Layouts.get("data_layer", "recomb_rate", { namespace: { "recomb": "recomb" }, name: "Recombination Rate" })
//    ],
//    dashboard: LocusZoom.Layouts.get("panel", "association")["dashboard"]
//};
//
//association_panel_mods.dashboard.components.push({
//    type: "data_layers",
//    position: "right",
//    statuses: ["faded", "hidden"]
//});
//
//
//var layout = {
//    width: 800,
//    height: 500,
//    responsive_resize: true,
//    panels: [
//        LocusZoom.Layouts.get("panel", "association", association_panel_mods),
//        LocusZoom.Layouts.get("panel", "genes", { namespace: { "gene": "gene" } }),
//        {
//            id:"custom_panel"
//
//        },
//
//
//
//    ]
//};
//
//var plot = LocusZoom.populate("#plot", data_sources, layout);
//
//</script>
//
//</body>
//</html>
