<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="core"/>
    <r:require modules="core"/>
    <r:layoutResources/>

</head>

<body>
<script>
    var variant;
    $.ajax({
        cache:false,
        type:"post",
        url:"../geneInfoAjax",
        data:{geneName:'<%=geneName%>'},
        async:true,
        success: function (data) {
            fillTheGeneFields(data) ;
            console.log('Finish processing fillTheGeneFields ')
        }
    });
    function cohortDetermination (  abbreviation,  method) {
        if (abbreviation ==='AA') {
            return "African-Americans (${method})"
        }  else  if (abbreviation ==='EA') {
            return "East Asians ("+method+")"
        }  else  if (abbreviation ==='HS') {
            return "Hispanics ("+method+")"
        } else  if (abbreviation ==='SA') {
            return "South Asians ("+method+")"
        } else  if (abbreviation ==='EU') {
            return "Europeans ("+method+")"
        } else  {
            return ""+abbreviation+" ("+method+")"
        }
    }
     function fillAncestryTable(map) {
         for (var key in map){

         }
     }
    function fillVariantsAndAssociationsSection (gene_info) {
        $('#totalGwasVariants').append (gene_info.GWAS_T2D_VAR_TOTAL);
        $('#totalGwasVariantAnchor')[0].href= "/dport/region/regionInfo/chr"+gene_info.CHROM+":"+gene_info.BEG+"-"+gene_info.END ;
        var currentLine = "";
        if (gene_info.GWAS_T2D_GWS_TOTAL > 0){
            currentLine += '<strong>';
        }
        currentLine += ""+gene_info.GWAS_T2D_GWS_TOTAL+ " are associated with type 2 diabetes at or above genome-wide significance";
        if (gene_info.GWAS_T2D_GWS_TOTAL > 0){
            currentLine += '</strong>';
        }
        $('#diabetesAtOrAboveGwas').append (currentLine);
        $('#diabetesAtOrAboveGwasAnchor')[0].href= "/dport/region/regionInfo/chr"+gene_info.CHROM+":"+gene_info.BEG+"-"+gene_info.END ;


    }
    function fillTheGeneFields (data)  {
        var rawGeneInfo =  data['geneInfo'];
        var geneInfo = {};
        geneInfo.variationTable =  [] ;
        fillVariantsAndAssociationsSection (rawGeneInfo)
        $('#continentalAncestryTable').append(fillAncestryTable()) ;
        if ((rawGeneInfo) && (rawGeneInfo._13k_T2D_ORIGIN_VAR_TOTALS) ) {
            $('#continentalAncestryTable').append(fillAncestryTable(rawGeneInfo._13k_T2D_ORIGIN_VAR_TOTALS));
        }
            for (var key in rawGeneInfo._13k_T2D_ORIGIN_VAR_TOTALS){
                var record = rawGeneInfo._13k_T2D_ORIGIN_VAR_TOTALS[key];
            }
        }
        %{--if (variationTable) {--}%
            %{--<g:each in="${0..(variationTable.size()-1)}">--}%
            %{--if (variationTable[it]) {--}%
                %{--geneInfo.variationTable.push({"cohort": "${variationTable[it]["COHORT"]}",--}%
                    %{--"participants": "${variationTable[it]["NS"]}",--}%
                    %{--"variants": "${variationTable[it]["TOTAL"]}",--}%
                    %{--"common": "${variationTable[it]["COMMON"]}",--}%
                    %{--"lowfrequency": "${variationTable[it]["LOW_FREQUENCY"]}",--}%
                    %{--"rare": "${variationTable[it]["RARE"]}"--}%
                %{--});--}%
            %{--}--}%
            %{--</g:each>--}%
        %{--}--}%



</script>

<div id="main">

    <div class="container" >

        <div class="gene-info-container" >
            <div class="gene-info-view" >

    <h1>
        <em><%=geneName%></em>
        <a class="page-nav-link" href="#associations">Associations</a>
        <a class="page-nav-link" href="#populations">Populations</a>
        <a class="page-nav-link" href="#biology">Biology</a>
    </h1>



    <g:if test="${(geneName == "C19orf80")||
                    (geneName == "PAM")||
                    (geneName == "SLC30A8")||
                    (geneName == "WFS1")}">
        <div class="gene-summary">
            <div class="title">Curated Summary</div>

            <div id="geneHolderTop" class="top">
                <script>
                    var contents = "<g:renderGeneSummary geneFile="${geneName}-top"></g:renderGeneSummary>";
                     $('#geneHolderTop').html(contents);
                </script>

            </div>

            <div class="bottom ishidden" id="geneHolderBottom" style="display: none;">
                <script>
                   // var contents = "$<g:renderGeneSummary geneFile="${geneName}-bottom"></g:renderGeneSummary>";
                    var contents = "<%=renderGeneSummary(geneFile:"${geneName}-bottom")%>";
                    $('#geneHolderBottom').html(contents);
                </script>

                %{--<%=gene_info.GENE_SUMMARY_BOTTOM%>--}%
            </div>
            <a class="boldlink" id="gene-summary-expand">click to expand</a>
        </div>
    </g:if>

    %{--<script>--}%
         %{--var geneInfo = {};--}%
         %{--geneInfo.variationTable =  [] ;--}%
         %{--if (variationTable) {--}%
             %{--<g:each in="${0..(variationTable.size()-1)}">--}%
             %{--if (variationTable[it]) {--}%
                 %{--geneInfo.variationTable.push({"cohort": "${variationTable[it]["COHORT"]}",--}%
                     %{--"participants": "${variationTable[it]["NS"]}",--}%
                     %{--"variants": "${variationTable[it]["TOTAL"]}",--}%
                     %{--"common": "${variationTable[it]["COMMON"]}",--}%
                     %{--"lowfrequency": "${variationTable[it]["LOW_FREQUENCY"]}",--}%
                     %{--"rare": "${variationTable[it]["RARE"]}"--}%
                 %{--});--}%
             %{--}--}%
             %{--</g:each>--}%
         %{--}--}%

    %{--</script>--}%


    %{--<p><strong>Uniprot Summary:</strong> <%=gene_info.Function_description%></p>--}%

    %{--<div class="separator"></div>--}%

    <g:render template="variantsAndAssociations" />

    %{--<div class="separator"></div>--}%

    %{--<g:render template="variationAcrossContinents" />--}%

    %{--<div class="separator"></div>--}%

     %{--<g:render template="biologicalHypothesisTesting" />--}%

     %{--<div class="separator"></div>--}%

     %{--<g:render template="findOutMore" />--}%

            </div>
        </div>
    </div>

</div>

</body>
</html>

