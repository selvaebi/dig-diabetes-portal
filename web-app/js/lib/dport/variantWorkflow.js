var mpgSoftware = mpgSoftware || {};


(function () {
    "use strict";


    mpgSoftware.variantWF = (function () {
        // private variables
        var currentInteractivity = 1, // 0->defining a filter, 1-> potentially manipulating our  list of existing filters
        activeColor = '#0008b',
        inactiveColor = '#808080',
        MAXIMUM_NUMBER_OF_FILTERS=1000;

        /***
         * private methods
         * @param indexNumber
         */
        var JSON_VARIANT_MOST_DEL_SCORE_KEY      = "MOST_DEL_SCORE",
            JSON_VARIANT_CHROMOSOME_KEY      = "CHROM",
            JSON_VARIANT_POLYPHEN_PRED_KEY      = "PolyPhen_PRED",
            JSON_VARIANT_SIFT_PRED_KEY      = "SIFT_PRED",
            JSON_VARIANT_CONDEL_PRED_KEY    = "Condel_PRED";


        /***
         *   true implies emphasize blue box and deemphasize clause development area.
         *   False implies deemphasize blue box and emphasize clause development area.
         */
        var emphasizeBlueBox = function(hoorayBlueBox){
            if(hoorayBlueBox){
                $('.bluebox').addClass('inputGoesHere');
                $('.panel').removeClass('inputGoesHere');
            }else {
                $('.panel').addClass('inputGoesHere');
                $('.bluebox').removeClass('inputGoesHere');
            }

        };
        /***
         * add standard state dependent message unless there is an override text (and then display the override)
         */
        var whatToDoNext = function(state, override){
            var suggestionField = $('.suggestionsVariable');
            if (typeof override !== 'undefined') {
                suggestionField.text (override);
            }else {
                switch (state){
                    case 0:
                        suggestionField.text ('Choose a trait from the drop-down box');
                        $('#clauseEdit').hide();
                        $('#clauseCreation').show();
                        break;
                    case 1:
                        suggestionField.text ('Choose one of the available data sets');
                        $('#clauseEdit').hide();
                        $('#clauseCreation').show();
                        break;
                    case 2:
                        suggestionField.text ('Add additional filters, or else click Build request button');
                        break;
                    case 3:
                        suggestionField.text ('Editing existing clause.');
                        $('#clauseEdit').show();
                        $('#clauseCreation').hide();
                        break;
                    case 101:
                        suggestionField.text ('Clause added.  You may edit, or remove a clause in the blue box, or else begin building an additional clause in the white box.');
                        $('#clauseEdit').hide();
                        $('#clauseCreation').hide();
                        break;
                    case 102:
                        suggestionField.text ('Clause canceled.  You may edit, or remove a clause in the blue box, or else begin building an additional clause in the white box.');
                        $('#clauseEdit').hide();
                        $('#clauseCreation').hide();
                        break;
                    case 103:
                        suggestionField.text ('You may create a new data filter.  No filters currently exist that might be edited');
                        $('#clauseEdit').hide();
                        $('#clauseCreation').show();
                        break;

                    default:
                        suggestionField.text ('');
                        break;
                }
            }
        };


        var existingFiltersManipulators = function(x){ // 0 deactivates, 1 activates
            var filterActivator = $('.filterActivator');
            if (x){
                currentInteractivity=1;
                emphasizeBlueBox(true);
                filterActivator.css('color',activeColor);
                filterActivator.css('cursor', 'pointer');
            }else {
                currentInteractivity=0;
                emphasizeBlueBox(false);
                filterActivator.css('color',inactiveColor);
                filterActivator.css('cursor', 'default');
            }
        };
        var numberExistingFilters = function (x){
            var filterCount = $('#totalFilterCount');
            var returnValue = 0;
            if (!arguments.length) {//no argument, this is a getter call
                if (typeof filterCount !== 'undefined') {
                    returnValue =  parseInt (filterCount.attr('value'));
                }
            } else {// we received an argument, treat this as a setter
                if (typeof filterCount !== 'undefined') {
                    filterCount.attr('value',x)
                }
            }
            return returnValue;
        };
         var handleBlueBoxVisibility = function (){
            var blueBox = $('.bluebox');
            if (numberExistingFilters() > 0){
                blueBox.show();
            } else {
                blueBox.hide();
            }
        };
         // getter/setter.
        // 0 === we are working on a single filter
        // 1 === all of the existing filters can be manipulated, since single filter is not in play
        var currentInteractivityState = function(newValue){
            if (!arguments.length) return currentInteractivity;
           // if (currentInteractivity  !==  newValue){ // the state of things is changing. Make sure the interface is up-to-date
                existingFiltersManipulators (newValue);
           // }
        };
        var forgetThisFilter = function  (indexNumber){
            if(typeof indexNumber !== 'undefined'){
                $('#savedValue'+indexNumber).remove ();
                $('#filterBlock'+indexNumber).remove ();
            }
        };
        // we have removed one filter. Remember the others to be contiguous
        var renumberHiddenFilters = function  (indexNumber,highestNumberFilter){
            for (  var i = indexNumber; i < highestNumberFilter-1 ; i++ ){
                $('#savedValue'+(i+1)).attr('id','savedValue'+i);
//                var codedFilters = $('#savedValue'+(i+1)).val();
//                if (typeof codedFilters !== 'undefined')  {
//                    var textOfSavedField = '<input type="text" class="form-control" id="savedValue'+i+'" value="'+codedFilters+'" style="height:0px">';
//                    $('#hiddenFields').append(textOfSavedField); // add a filter
//                    $('#savedValue'+(i+1)).remove(); // remove the old one
//                }
            }
         };
        var renumberFilterBlocks = function  (indexNumber,highestNumberFilter){
            // Rename the blocks that hold each filter ( and think these IDs do anything, but let's be consistent)
            for (  var i = indexNumber; i < highestNumberFilter-1 ; i++ ){
                $('#filterBlock'+(i+1)).attr('id','filterBlock'+i);
            }
            // This id allows each pencil To know which filter it refers to
            for (  var i = indexNumber; i < highestNumberFilter-1 ; i++ ){
                $('#editor'+(i+1)).attr('id','editor'+i);
            }
            // This ID allows each the leader icon to know which filter it refers to
            for (  var i = indexNumber; i < highestNumberFilter-1 ; i++ ){
                $('#remover'+(i+1)).attr('id','remover'+i);
            }
        };
        var instantiatePhenotype = function (value) {
            $('#phenotype').val(value)
        };
        var instantiateInputFields = function (clauseDefinition){
            var extractString = function (fullString,marker){
                var startIndex = fullString.indexOf(marker)+marker.length;
                var remainingString = fullString.substr(startIndex);
                var endIndex = remainingString.indexOf('^');
                return fullString.substr(startIndex,endIndex);
            };
            if (typeof clauseDefinition  !== 'undefined') {
                var filters = clauseDefinition.split("^");
                for ( var i = 0 ; i < filters.length ; i++ ){
                    var oneFilter = filters [i];
                    if (oneFilter){
                        var fieldVersusValue =  oneFilter.split("=");
                        if (fieldVersusValue.length === 2 ){
                            switch (fieldVersusValue[0]) {
                                case '1'://instantiatePhenotype (fieldVersusValue[1]);
                                    break;
                                case '2':mpgSoftware.firstResponders.displayDataSetChooser(fieldVersusValue[1]);
                                    break;
                                case '3': // There are two fields we need to handle here.  Let's pull out the other one by hand
                                    break;// or value and or inequality are handled together, so skip one
                                case '4':break;// Ignore
                                case '5': // There are two fields we need to handle here.  Let's pull out the other one by hand
                                    break;// or value and or inequality are handled together, so skip one
                                case '6':break;
                                case '7':
                                    $('#region_gene_input').val(fieldVersusValue[1]);
                                    $('#cPropertiesSection').collapse('show');
                                    break;
                                case '8'://  chromosome name, handled under 10
                                    $('#region_chrom_input').val(fieldVersusValue[1]);
                                    $('#cPropertiesSection').collapse('show');
                                    break;
                                case '9':// chromosome start, handled under 10
                                    $('#region_start_input').val(fieldVersusValue[1]);
                                    $('#cPropertiesSection').collapse('show');
                                case '10': // chromosome end -- handle a chromosome here
                                    $('#region_stop_input').val(fieldVersusValue[1]);
                                    $('#cPropertiesSection').collapse('show');
                                    break;
                                case '11':
                                    var predictedValues = fieldVersusValue[1].split('|');
                                    if ((typeof predictedValues !== 'undefined') &&
                                        (predictedValues.length > 1)){
                                        if ((predictedValues [0] === JSON_VARIANT_MOST_DEL_SCORE_KEY)){
                                            $('[name="predictedEffects"]').filter ('[value ="'+predictedValues[1]+'"]').prop('checked',true);
                                            if (predictedValues[1]==='2') {
                                                chgRadioButton('2');
                                            }
                                        } else  if ((predictedValues [0] === JSON_VARIANT_POLYPHEN_PRED_KEY)){
                                            $('[name="polyphen"]').val (predictedValues[1]);
                                        } else if ((predictedValues [0] === JSON_VARIANT_SIFT_PRED_KEY)){
                                            $('[name="sift"]').val (predictedValues[1]);
                                        } else if ((predictedValues [0] === JSON_VARIANT_CONDEL_PRED_KEY)){
                                            $('[name="condel"]').val (predictedValues[1]);
                                        }
                                        $('#cPropertiesSection').collapse('show');
                                    }
                                    break;
                                case '12': // There are two fields we need to handle here.  Let's pull out the other one by hand
                                    //mpgSoftware.firstResponders.respondToReviseFilters('effectsize',extractString (clauseDefinition,'^13='),fieldVersusValue[1]);
                                    break;// or value and or inequality are handled together, so skip one
                                case '14':break;//  chromosome name, handled under 11
                                case '15':break;//  chromosome name, handled under 11
                                case '16':break;//  chromosome name, handled under 11
                                case '17':
                                    mpgSoftware.firstResponders.respondToReviseCustomFilter(fieldVersusValue[1]);
                                    break;
                                default: break;
                            }
                        }

                    }

                }
            }
        };
        var makeClauseCurrent = function (indexNumber) {
            if (typeof indexNumber !== 'undefined') {
                var codedFilters = $('#savedValue'+indexNumber).val();
                if (typeof codedFilters  !== 'undefined'){
                    instantiateInputFields (codedFilters);
                }
            }
        };
        var hideThisClauseForNow = function (indexNumber) {
            if (typeof indexNumber !== 'undefined') {
                var displayableFilter = $('#filterBlock'+indexNumber);
                displayableFilter.hide();
                displayableFilter.addClass('temporarilyHiding');
            }
        };
        var extractEnumeratedValuesFromDom= function (identifyingString,numberExistingFilters) {
            var intermediateValue = [];
            var returnValue = [];
            if (typeof identifyingString !== 'undefined'){
                for( var i = 0 ; i < MAXIMUM_NUMBER_OF_FILTERS ; i++ ){
                    var lookUpString = identifyingString +i;
                    var domElement =  $(lookUpString);
                    if (typeof domElement !== 'undefined') {
                        var associatedValue = domElement.val();
                        domElement.remove();
                        if (typeof associatedValue !== 'undefined') {
                            intermediateValue.push(associatedValue);
                        }
                    }
                }
            }
            var numberOfIntermediateValues = intermediateValue.length;
            for ( var i = 0 ; (i < numberExistingFilters) && (i < numberOfIntermediateValues) ; i++ ){
                returnValue.push(numberOfIntermediateValues [i]);
            }
            return returnValue;
        };
        var extractEnumeratedHtmlFromDom= function (identifyingString,numberExistingFilters) {
            var intermediateValue = [];
            var returnValue = [];
            if (typeof identifyingString !== 'undefined'){
                for( var i = 0 ; i < MAXIMUM_NUMBER_OF_FILTERS ; i++ ){
                    var lookUpString = identifyingString +i;
                    var domElement =  $(lookUpString);
                    if (typeof domElement !== 'undefined') {
                        var associatedValue = domElement.html();
                        domElement.remove();
                        if (typeof associatedValue !== 'undefined') {
                            intermediateValue.push(associatedValue);
                        }
                    }
                }
            }
            var numberOfIntermediateValues = intermediateValue.length;
            for ( var i = 0 ; (i < numberExistingFilters) && (i < numberOfIntermediateValues) ; i++ ){
                returnValue.push(numberOfIntermediateValues [i]);
            }
            return returnValue;
        };
        var insertCodedFilter = function (index,codedFilters,numberExistingFilters) {
            if ((typeof index  !== 'undefined') &&
                (typeof codedFilters  !== 'undefined') &&
                (typeof numberExistingFilters  !== 'undefined')){
                   var allCodedFilters = extractEnumeratedValuesFromDom ('savedValue',numberExistingFilters);
                   for ( var i = 0 ; ((i < index)  && (i < allCodedFilters.length)) ; i++ ){
                       $('#hiddenFields').append('<input type="text" class="form-control" id="savedValue'+i+'" value="'+allCodedFilters[i]+'" style="height:0px">');
                   }
                $('#hiddenFields').append('<input type="text" class="form-control" id="savedValue'+index+'" value="'+codedFilters+'" style="height:0px">');
                for ( var i = index+1 ; (i < allCodedFilters.length) ; i++ ){
                    $('#hiddenFields').append('<input type="text" class="form-control" id="savedValue'+i+'" value="'+allCodedFilters[i-1]+'" style="height:0px">');
                }
            }
        };
        var insertDisplayableFilter = function (index,codedFilters,numberExistingFilters) {
            if ((typeof index  !== 'undefined') &&
                (typeof codedFilters  !== 'undefined') &&
                (typeof numberExistingFilters  !== 'undefined')){
                var allCodedFilters = extractEnumeratedHtmlFromDom ('savedValue',numberExistingFilters);
                for ( var i = 0 ; ((i < index)  && (i < allCodedFilters.length)) ; i++ ){
                    $('#developingQuery').append('<input type="text" class="form-control" id="savedValue'+i+'" value="'+allCodedFilters[i]+'" style="height:0px">');
                }
                $('#developingQuery').append('<input type="text" class="form-control" id="savedValue'+index+'" value="'+codedFilters+'" style="height:0px">');
                for ( var i = index+1 ; (i < allCodedFilters.length) ; i++ ){
                    $('#developingQuery').append('<input type="text" class="form-control" id="savedValue'+i+'" value="'+allCodedFilters[i-1]+'" style="height:0px">');
                }
            }
        };
        var resuscitateClauseWeWereEditing = function () {
            var clauseToBringBack = jQuery( ".temporarilyHiding:hidden" );
            clauseToBringBack.show();
        };
        var removeClauseWeWereEditing = function () {
            var clauseToBringBack = jQuery( ".temporarilyHiding:hidden" );
            clauseToBringBack.show();
            var filterIndex = extractIndex ('filterBlock',clauseToBringBack);
            forgetThisFilter (filterIndex);
            renumberHiddenFilters (filterIndex,numberExistingFilters());
            renumberFilterBlocks (filterIndex,numberExistingFilters());
            numberExistingFilters(numberExistingFilters()-1);
        };

        var weAreClauseEditing = function (){
            return $('#clauseEdit').is(":visible");
        };
        var retrievePhenotypes = function () {
            var loading = $('#spinner').show();
            $.ajax({
                cache: false,
                type: "post",
                url: "./retrievePhenotypesAjax",
                data: {},
                async: true,
                success: function (data) {
                    if (( data !==  null ) &&
                        ( typeof data !== 'undefined') &&
                        ( typeof data.datasets !== 'undefined' ) &&
                        (  data.datasets !==  null ) ) {
                        UTILS.fillPhenotypeCompoundDropdown(data.datasets,'#phenotype',true);
                    }
                    loading.hide();
                },
                error: function (jqXHR, exception) {
                    loading.hide();
                    core.errorReporter(jqXHR, exception);
                }
            });
        };

        var retrieveDataSets = function (phenotype, dataset,dropdownAlreadyPresent) {
            if (!dropdownAlreadyPresent) { // it may be that we already did this round-trip, in which case we don't need to do it again
                var loading = $('#spinner').show();
                $.ajax({
                    cache: false,
                    type: "post",
                    url: "./retrieveDatasetsAjax",
                    data: {phenotype: phenotype,
                        dataset: dataset},
                    async: true,
                    success: function (data) {
                        if (( data !== null ) &&
                            ( typeof data !== 'undefined') &&
                            ( typeof data.datasets !== 'undefined' ) &&
                            (  data.datasets !== null )) {
                            fillDataSetDropdown(data.datasets,data.sampleGroup.sampleGroup);
                        }
                        loading.hide();
                    },
                    error: function (jqXHR, exception) {
                        loading.hide();
                        core.errorReporter(jqXHR, exception);
                    }
                });
            }
        };
        /***
         * we need to go back to the server to get a list of properties. This can happen
         * into conditions:
         * 1) when the user has specified a phenotype and we need to pull back all associated properties.
         *    In this case none of the properties have values
         * 2) when the user is seeking to edit an existing filter.  In this case one or more of those properties
         *    may have an associated value. In this case this routine will be called once for each property
         * @param phenotype
         * @param dataset
         * @param property
         * @param equiv
         * @param value
         */
        var retrievePropertiesPerDataSet = function (phenotype,dataset,property,equiv,value) {
            var loading = $('#spinner').show();
            if (typeof property  === 'undefined') { // we are in case #1 as described above, and should therefore wipe out all existing properties
                $('.propertyHolderBox').remove();
            }
            $.ajax({
                cache: false,
                type: "post",
                url: "./retrievePropertiesAjax",
                data: {phenotype: phenotype,dataset: dataset},
                async: true,
                success: function (data) {
                    if (( data !==  null ) &&
                        ( typeof data !== 'undefined') &&
                        ( typeof data.datasets !== 'undefined' ) &&
                        (  data.datasets !==  null ) ) {
                        var dropdownAlreadyPresent = ($('.cusText').is(":visible"));// Are there any properties already specified
                        if (!dropdownAlreadyPresent) { // it may be that we already did this round-trip, in which case we don't need to do it again
                            fillPropertiesDropdown(data.datasets);
                        }
                        mpgSoftware.firstResponders.forceToPropertySelection (property, equiv, value);
                        // make sure that the data set drop-down choice points to the right thing
                        if (typeof data.chosenDataset !== 'undefined'){
                            $('#dataSet').val(data.chosenDataset);
                        }
                    }
                    loading.hide();
                },
                error: function (jqXHR, exception) {
                    loading.hide();
                    core.errorReporter(jqXHR, exception);
                }
            });
        };

        var extractIndex = function (idLabel,currentObject){
            var filterIndex = -1;
            var id = $(currentObject).attr ('id');
            var desiredLocation = id.indexOf (idLabel);
            if ((desiredLocation > -1) &&
                (typeof id !== 'undefined') ){
                var filterIndexString = id.substring(id.indexOf(idLabel)+ idLabel.length);
                filterIndex = parseInt(filterIndexString);
            }
            return filterIndex;
        };


        /***
         * public methods
         * @param currentObject
         */


        var removeThisClause = function (currentObject){
            if (currentInteractivityState()){
                var filterIndex = extractIndex ('remover',currentObject);
                forgetThisFilter (filterIndex);
                renumberHiddenFilters (filterIndex,numberExistingFilters());
                renumberFilterBlocks (filterIndex,numberExistingFilters());
                numberExistingFilters(numberExistingFilters()-1);
                handleBlueBoxVisibility ();
                whatToDoNext(102);

            }
        };
        var editThisClause = function (currentObject){
            if (currentInteractivityState()){
                var filterIndex = extractIndex ('editor',currentObject);
                hideThisClauseForNow(filterIndex);
                makeClauseCurrent (filterIndex);
                // Here is how we delete clause
//                forgetThisFilter (filterIndex);
//                renumberHiddenFilters (filterIndex,numberExistingFilters());
//                renumberFilterBlocks (filterIndex,numberExistingFilters());
//                numberExistingFilters(numberExistingFilters()-1);
                handleBlueBoxVisibility ();
                $('#additionalFilterSelection').show ();
                whatToDoNext(3);
            }
        };
        var removeThisFilter = function (currentObject){
            if (typeof currentObject !== 'undefined') {
                var currentObjectId = currentObject.id;
                var targetName = currentObjectId.split("___")[1];
                var target = $('#'+targetName);
                if (typeof target !== 'undefined')  {
                    target.remove ();
                }
            }
         };
        var fillDataSetDropdown = function (dataSetJson, sampleGroup) { // help text for each row
            if ((typeof dataSetJson !== 'undefined')  &&
                (typeof dataSetJson["is_error"] !== 'undefined')&&
                (dataSetJson["is_error"] === false))
            {
                var numberOfRecords = parseInt (dataSetJson ["numRecords"]);
                var options = $("#dataSet");
                options.empty();
                var dataSetList = dataSetJson ["dataset"];
                var rememberLastValue;
                for ( var i = 0 ; i < numberOfRecords ; i++ ){
                    var preceedingUnderscores = 0;
                    for (var j=0; j<dataSetList[i].length;j++ ){
                        if (dataSetList[i][j]!='-') break;
                        preceedingUnderscores++;
                    }
                    var replaceUnderscores = dataSetList[i].displayName.substr(0,preceedingUnderscores);
                    rememberLastValue = dataSetList[i].displayName.substr(preceedingUnderscores);
                    options.append($("<option />").val(dataSetList[i].name.substr(preceedingUnderscores))
                                                  .text(replaceUnderscores+dataSetList[i].displayName.substr(preceedingUnderscores)));
                }
                if (numberOfRecords===1){
                    $("#dataSet").val(rememberLastValue);
                    $("#dataSet").click();
                }
                if (((typeof sampleGroup !== 'undefined')  &&
                    (sampleGroup !== 'null') &&
                    (sampleGroup !== ''))){
                    $("#dataSet").val(sampleGroup);
                }

            }
        };
        var fillPropertiesDropdown = function (dataSetJson) { // help text for each row
            if ((typeof dataSetJson !== 'undefined')  &&
                (typeof dataSetJson["is_error"] !== 'undefined')&&
                (dataSetJson["is_error"] === false))
            {
                var numberOfRecords = parseInt (dataSetJson ["numRecords"]);
                var dataSetList = dataSetJson ["dataset"];
                var holder = $('#filterHolder');
                for ( var i = 0 ; i < numberOfRecords ; i++ ){
                    mpgSoftware.firstResponders.addOnePropertyFilter(holder,dataSetList[i]);
                }
            }
        };
        var extractValsFromComboboxAndReturn = function (everyId) {
            var returnValue = {};
            for (var i = 0; i < everyId.length; i++) {
                var domReference = $('#'+ everyId[i]);
                if ((domReference) && (domReference.val())) {
                    return domReference.val();
                }
            }
            return returnValue;
        };
        var extractValFromTextboxesWithPrependedName = function (everyId,prepender,equivalenceMap,forceNumeric) {
            var returnValue = {};
            for (var i = 0; i < everyId.length; i++) {
                var domReference = $('#' + everyId[i]);
                if ((domReference) && (domReference.val())) {
                    var propertyValue =  domReference.val();
                    if  ((forceNumeric)  &&  (!($.isNumeric(propertyValue))) )  {
                        alert("Error.  Numeric value required. Cannot accept value ='"+propertyValue+"'");
                        return {};
                    }  else {
                        var propertyNameHolder = everyId[i];
                        var nameParts = propertyNameHolder.split("___");
                        var propertyName = nameParts[0];
                        var equiv = equivalenceMap[propertyName];
                        returnValue [ prepender+equiv+'^'+everyId[i]] = domReference.val();
                    }
                }
            }
            return returnValue;
        };
        var customIds = function (){
            var element;
            var returnValue = {customEquivalences:[],customTexts:[]};
            var allEquivalentsBoxes =  $('.cusEquiv');
            if (typeof allEquivalentsBoxes !== 'undefined') {
                for ( var i = 0 ; i < allEquivalentsBoxes.length ; i++ ){
                    element = $(allEquivalentsBoxes[i]);
                    returnValue.customEquivalences.push (element.attr ('id'));
                }
            }
            var allTextBoxes =  $('.cusText');
            if (typeof allTextBoxes !== 'undefined') {
                for ( var i = 0 ; i < allTextBoxes.length ; i++ ){
                    element = $(allTextBoxes[i]);
                    returnValue.customTexts.push (element.attr ('id'));
                }
            }
            return returnValue;
         };
        var extractValsFromComboboxAbbrevName = function (everyId) {
            var returnValue = {};
            for (var i = 0; i < everyId.length; i++) {
                var domReference = $('#' + everyId[i]);
                if ((domReference) && (domReference.val())) {
                    var nameParts = everyId[i].split("___");
                    var abbreviatedName= nameParts[0];
                    returnValue [abbreviatedName] = domReference.val();
                }
            }
            return returnValue;
        };
        var gatherFieldsAndPostResults = function (){
            var weHaveFiltersWorthAdding = function(potMap){
                var returnValue = false;
                for (var key in potMap) {
                    if (potMap.hasOwnProperty(key)) {
                        // are there filters worth adding? Predicted effects has a default. SavedValues don't count.
                        var value = potMap[key];
                        if ( ( key === 'predictedEffects')  &&
                            ( value !== 'all-effects')  ) {
                            returnValue = true;
                        }  else if ( ( !key.startsWith('savedValue') ) &&
                                     ( key !== 'predictedEffects' ) ){
                            returnValue = true;
                        }
                    }
                }
                return returnValue;
            }
            // before doing anything else we need to erase any hidden old filters
            if (weAreClauseEditing()){
                removeClauseWeWereEditing();
            }
            var varsToSend = {};
            var phenotypeExtractor = {};
            var datasetExtractor = {};
            var phenotypeInput = UTILS.extractValsFromCombobox(['phenotype']);
            phenotypeExtractor = _.assign(phenotypeExtractor,phenotypeInput) ;
            var datasetInput = UTILS.extractValsFromCombobox(['dataSet']);
            datasetExtractor = _.assign(datasetExtractor,datasetInput) ;
            var idsToCollect =  customIds();
            var equivFields;
            var textFields;
            var prependerString = 'custom47^' +phenotypeExtractor ['phenotype']+'^'+datasetExtractor ['dataSet']+'^';
            if ((typeof idsToCollect  !== 'undefined')  &&
                (typeof idsToCollect.customTexts  !== 'undefined') &&
                (idsToCollect.customTexts.length > 0)){
                var equivalences = extractValsFromComboboxAbbrevName(idsToCollect.customEquivalences);
                textFields =  extractValFromTextboxesWithPrependedName(idsToCollect.customTexts,prependerString,equivalences,true);
                if ($.isEmptyObject(textFields)) { return 0; }
            }
            var restrictToRegion = UTILS.extractValFromTextboxes(['region_gene_input','region_chrom_input','region_start_input','region_stop_input']);
            var missensePredictions = [];
            varsToSend["predictedEffects"]  = $("input:radio[name='predictedEffects']:checked").val();
            if (varsToSend["predictedEffects"]==='2'){
                missensePredictions = UTILS.extractValsFromCombobox(['polyphenSelect','siftSelect','condelSelect']);
            }
            var savedValuesList = [];
            var savedValue = {};
            var totalFilterCount = UTILS.extractValFromTextboxes(['totalFilterCount']);
            if (typeof totalFilterCount['totalFilterCount'] !== 'undefined') {
                var valueCount = parseInt(totalFilterCount['totalFilterCount']);
                if (valueCount>0){
                    for ( var i = 0 ; i < valueCount ; i++ ){
                        savedValuesList.push ('savedValue'+i);
                    }
                    savedValue = UTILS.extractValFromTextboxes(savedValuesList);
                }
            }
            varsToSend = _.assign(varsToSend,restrictToRegion) ;
            varsToSend = _.assign(varsToSend,missensePredictions) ;
            varsToSend = _.assign(varsToSend,textFields) ;
            varsToSend = _.assign(varsToSend,savedValue) ;
            if (weHaveFiltersWorthAdding(varsToSend)) {
                console.log("filters being sent", varsToSend);
                UTILS.postQuery('./variantVWRequest',varsToSend);
            }
        };
        var cancelThisFieldCollection = function (){
            var varsToSend = {};
            var savedValue = {};
            var savedValuesList = [];
            // we have to treat canceling an existing query differently from canceling a new query
            if (weAreClauseEditing()){
                resuscitateClauseWeWereEditing();
                // reset the screen
                $('#dataSetChooser').hide();
                var filterHolder = $('#filterHolder');
                filterHolder.empty();
                $('.bluebox').focus();
                handleBlueBoxVisibility ();
                currentInteractivityState(1);
                whatToDoNext(102);
            } else {
                var totalFilterCount = UTILS.extractValFromTextboxes(['totalFilterCount']);
                if (typeof totalFilterCount['totalFilterCount'] !== 'undefined') {
                    var valueCount = parseInt(totalFilterCount['totalFilterCount']);
                    if (valueCount>0){
                        for ( var i = 0 ; i < valueCount ; i++ ){
                            savedValuesList.push ('savedValue'+i);
                        }
                        savedValue = UTILS.extractValFromTextboxes(savedValuesList);
                    }
                }
                varsToSend = UTILS.concatMap(varsToSend,savedValue) ;
                UTILS.postQuery('./variantVWRequest',varsToSend);
            }
         };
        var launchAVariantSearch = function (){
            var varsToSend = {};
            var savedValuesList = [];
            var savedValue = {};
            var totalFilterCount = UTILS.extractValFromTextboxes(['totalFilterCount']);
            if (typeof totalFilterCount['totalFilterCount'] !== 'undefined') {
                var valueCount = parseInt(totalFilterCount['totalFilterCount']);
                if (valueCount > 0) {
                    for (var i = 0; i < valueCount; i++) {
                        savedValuesList.push('savedValue' + i);
                    }
                    savedValue = UTILS.extractValFromTextboxes(savedValuesList);
                }
            }
            varsToSend = UTILS.concatMap(varsToSend, savedValue);
            UTILS.postQuery('./launchAVariantSearch', varsToSend);

        };

        var initializePage = function (){
            if (numberExistingFilters() > 0){
                handleBlueBoxVisibility ();
                currentInteractivityState(1);
                whatToDoNext(101);
                emphasizeBlueBox(true);
            } else {
                handleBlueBoxVisibility ();
                currentInteractivityState(0);
                whatToDoNext(0);
                emphasizeBlueBox(false);
            }
            retrievePhenotypes();
//            $("#phenotype").prepend("<option value='' selected='selected'></option>");

        };
        return {
            cancelThisFieldCollection:cancelThisFieldCollection,
            fillDataSetDropdown:fillDataSetDropdown,
            fillPropertiesDropdown:fillPropertiesDropdown,
            gatherFieldsAndPostResults:gatherFieldsAndPostResults,
            launchAVariantSearch:launchAVariantSearch,
            initializePage:initializePage,
            removeThisClause:removeThisClause,
            editThisClause:editThisClause,
            removeThisFilter:removeThisFilter,
            existingFiltersManipulators:existingFiltersManipulators,
            currentInteractivityState:currentInteractivityState,
            retrievePhenotypes:retrievePhenotypes,
            retrieveDataSets:retrieveDataSets,
            retrievePropertiesPerDataSet:retrievePropertiesPerDataSet,
            whatToDoNext:whatToDoNext
        }

    }());





















    /***
     * lots of callbacks, and other methods that respond directly to user interaction
     */
    mpgSoftware.firstResponders = (function () {
        /***
         * private
         */
        var appendValueWithEquivalenceChooser = function (currentDiv,holderId,section,helpTitle,helpText,equivalence,defaultValue){
            var sectionName = section.prop
            var displayName = section.translatedName

            var labelId = sectionName+'___nameId';
            var equivalenceId = sectionName+'___equivalenceId';
            var valueId = sectionName+'___valueId';

            // We need to create all of these fields and initialize them
            currentDiv.append("<div id='"+holderId+"' class='row clearfix propertyHolderBox'>"+
                "<div class='primarySectionSeparator'>"+
                "<div  id='"+labelId+"' class='col-sm-offset-1 col-md-3 text-right searchBuilderPrompt'>" + displayName + "</div>"+
                "<div class='col-md-1'>"+
                "<select id='"+equivalenceId+"' class='form-control btn-group btn-input clearfix cusEquiv'>"+
                "<option value='lessThan'>&lt;</option>"+
                "<option value='greaterThan'>&gt;</option>"+
                "<option value='equalTo'>=</option>"+
                "</select>"+
                "</div>"+
                "<div class='col-md-4'><input type='text' class='form-control cusText' id='"+valueId+"'></div>"+
                "<div class='col-md-1'>"+
                "</div>"+
                "<div class='col-md-2'>"+
                "</div>"+
                "</div>");
            if(equivalence) {
                $('#' + equivalenceId).val(equivalence);
            }
            if (typeof defaultValue !== 'undefined'){
                $('#'+valueId).val(defaultValue);
            }
        };


        var appendGeneChooser = function (currentDiv,holderId,sectionName,geneInputId,helpTitle,helpText,geneName){
            currentDiv.append("<div id='"+holderId+"' class='row clearfix'>"+
                "<div class='primarySectionSeparator'>"+
                "<div class='col-sm-offset-1 col-md-3'>"+sectionName+"</div>"+
                "<div class='col-md-5'>"+
                "<input type='text' class='form-control' id='region_gene_input' style='display: inline-block'/>"+
                "</div>"+
                "<div class='col-md-1'>"+
                "<span style='padding:10px 0 0 0' class='glyphicon glyphicon-question-sign pop-right' aria-hidden='true' data-toggle='popover' animation='true' "+
                "trigger='hover' data-container='body' data-placement='right' title='' data-content='"+helpText + "' data-original-title='"+helpTitle + "'></span>"+
                "</div>"+
                "<div class='col-md-2'>"+
                "</div>"+
                "</div>");
            if (typeof geneName !== 'undefined'){
                $('#region_gene_input').val(geneName);
            }

        };


        var appendPositionChooser = function (currentDiv,holderId,sectionName,chromosomeId,startHere,endHere,helpTitle,helpText,startingExtent,endingExtent,chromosomeName){
            currentDiv.append("<div id='"+holderId+"' class='row clearfix'>"+
                "<div class='primarySectionSeparator'>"+
                "<div class='col-sm-offset-1 col-md-3' style='text-align: right'>"+sectionName+"</div>"+
                "<div class='col-md-5'>"+
                    "<div class='row'>"+
                        "<div class='col-xs-4'>"+
                            "<input class='form-control' type='text' id='" + chromosomeId+ "' placeholder='chrom'/>"+
                        "</div>"+
                        "<div class='col-xs-1'></div>"+
                        "<div class='col-xs-3'>"+
                            "<input class='form-control' type='text' id='" + startHere+ "' style='display: inline-block' placeholder='start'/>"+
                        "</div>"+
                        "<div class='col-xs-1'></div>"+
                        "<div class='col-xs-3'>"+
                            "<input class='form-control' type='text' id='" + endHere+ "' style='display: inline-block' placeholder='stop'/>"+
                        "</div>"+
                    "</div>"+
                "</div>"+
                "<div class='col-md-1'>"+
                    "<span style='padding:10px 0 0 0' class='glyphicon glyphicon-question-sign pop-right' aria-hidden='true' data-toggle='popover' animation='true' "+
                    "trigger='hover' data-container='body' data-placement='right' title='' data-content='"+helpText + "' data-original-title='"+helpTitle + "'></span>"+
                "</div>"+
                "<div class='col-md-2'>"+
                "</div>"+
                "</div>");
            if (typeof startingExtent !== 'undefined'){
                $('#'+startHere).val(startingExtent);
            }
            if (typeof endingExtent !== 'undefined'){
                $('#'+endHere).val(endingExtent);
            }
            if (typeof chromosomeName !== 'undefined'){
                $('#'+chromosomeId).val(chromosomeName);
            }

        };

var appendProteinEffectsButtons = function (currentDiv,holderId,sectionName,allFunctionsCheckbox,proteinTruncatingCheckbox,missenseCheckbox,missenseOptions,
                                            polyphenSelect,siftSelect,condelSelect,synonymousCheckbox,noncodingCheckbox,    helpTitle,helpText,valueOne,valueTwo,valueThree,valueFour){
    var allEffectsSelected = '',
    proteinTruncatingSelected = '',
    missenseSelected = '',
    noEffectSynonymousSelected = '',
    noEffectNoncodingSelected = '',
        polyphen1='',polyphen2='',polyphen3='',
        condel1='',condel2='',condel3='',
        sift1='',sift2='',sift3='';
    if (typeof valueOne !== 'undefined'){
        if (valueOne === 'all-effects'){
            allEffectsSelected = "'checked'";
        } else if (valueOne === 'protein-truncating') {
            proteinTruncatingSelected = "'checked'";
        } else if (valueOne === 'missense') {
            missenseSelected = "'checked'";
        } else if (valueOne === 'noEffectSynonymous') {
            noEffectSynonymousSelected = "'checked'";
        } else if (valueOne === 'noEffectNoncoding') {
            noEffectNoncodingSelected = "'checked'";
        }
    }
    if (typeof valueTwo !== 'undefined') {
        if (valueTwo === 'probably_damaging'){
            condel1 = "'checked'";
        } else if (valueTwo === 'possibly_damaging') {
            condel2 = "'checked'";
        } else if (valueTwo === 'benign') {
            condel3 = "'checked'";
        }
    }
    if (typeof valueThree !== 'undefined') {
        if (valueThree === '---'){
            polyphen1 = "'checked'";
        } else if (valueThree === 'deleterious') {
            polyphen2 = "'checked'";
        } else if (valueThree === 'tolerated') {
            polyphen3 = "'checked'";
        }
    }
    if (typeof valueFour !== 'undefined') {
        if (valueFour === '---'){
            sift1 = "'checked'";
        } else if (valueFour === 'deleterious') {
            sift2 = "'checked'";
        } else if (valueFour === 'benign') {
            sift3 = "'checked'";
        }
    }
        currentDiv.append("<div id='"+holderId+"' class='row clearfix'>"+
        "<div class='primarySectionSeparator'>"+
        "<div class='col-sm-offset-1 col-md-3' style='text-align: right'>"+sectionName+"</div>"+
        "<div class='col-md-5'>"+
        "<div class='row clearfix'>"+
        "<div class='col-md-12'>"+
        "<div id='biology-form'>"+
        "<div class='radio'>"+
        "<input type='radio' name='predictedEffects' value='all-effects' id='" +allFunctionsCheckbox + "' onClick=\"chgRadioButton('all-effects')\" "+allEffectsSelected+"/>"+
        "all effects"+
        "</div>"+
        "<div class='radio'>"+
        "<input type='radio' name='predictedEffects' value='protein-truncating' id='" +proteinTruncatingCheckbox + "' onClick=\"chgRadioButton('protein-truncating')\" "+proteinTruncatingSelected+"/>"+
        "protein-truncating"+
        "</div>"+
        "<div class='radio'>"+
        "<input type='radio' name='predictedEffects' value='missense'  id='" +missenseCheckbox + "' onClick=\"chgRadioButton('missense')\" "+missenseSelected+"/>"+
        "missense"+
        "</div>"+
        "<div id='" + missenseOptions+ "' >"+
        "<div class='checkbox'>"+
        "PolyPhen-2 prediction"+
        "<select name='polyphen' id='" +polyphenSelect+ "'>"+
        "<option value=''>---</option>"+
        "<option value='probably_damaging' "+polyphen1+">probably damaging</option>"+
        "<option value='possibly_damaging' "+polyphen2+">possibly damaging</option>"+
        "<option value='benign' "+polyphen2+">benign</option>"+
        "</select>"+
        "</div>"+
        "<div class='checkbox'>"+
        "SIFT prediction"+
        "<select name='sift' id='" +siftSelect+ "'>"+
        "<option value=''>---</option>"+
        "<option value='deleterious' "+sift2+">deleterious</option>"+
        "<option value='tolerated' "+sift3+">tolerated</option>"+
        "</select>"+
        "</div>"+
        "<div class='checkbox'>"+
        "CONDEL prediction"+
        "<select name='condel' id='" +condelSelect+ "'>"+
        "<option value=''>---</option>"+
        "<option value='deleterious' "+condel2+">deleterious</option>"+
        "<option value='benign' "+condel3+">benign</option>"+
        "</select>"+
        "</div>"+
        "</div>"+
        "<div class='radio'>"+
        "<input type='radio' name='predictedEffects' value='noEffectSynonymous'  id='" +synonymousCheckbox + "' onClick=\"chgRadioButton('noEffectSynonymous')\"  "+noEffectSynonymousSelected+"/>"+
        "no effect (synonymous coding)"+
        "</div>"+
        "<div class='radio'>"+
        "<input type='radio' name='predictedEffects' value='noEffectNoncoding'  id='" +noncodingCheckbox + " onClick=\"chgRadioButton('noEffectNoncoding')\"  "+noEffectNoncodingSelected+"/>"+
        "no effect (non-coding)"+
        "</div>"+
        "</div>"+
        "</div>"+
        "</div>"+
        "</div>"+
        "</div>"+
        "<div class='col-md-1'>"+
        "<span style='padding:10px 0 0 0' class='glyphicon glyphicon-question-sign pop-right' aria-hidden='true' data-toggle='popover' animation='true' "+
        "trigger='hover' data-container='body' data-placement='right' title='' data-content='"+helpText + "' data-original-title='"+helpTitle + "'></span>"+
        "</div>"+
        "<div class='col-md-2'>"+
        "</div>"+
        "</div>");
    $('#all_functions_checkbox').click()

}



        var displayGeneChooser = function (holder,geneName){
            appendGeneChooser(holder,'geneHolder','gene','region_gene_input',
                'Gene chooser help title','everything there is to say about choosing a gene',geneName);
        };
        var displayPosChooser = function (holder,valueOne,valueTwo,valueThree){
            appendPositionChooser(holder,'geneHolder','position','region_chrom_input','region_start_input','region_stop_input',
                'position specification help title','everything there is to say about an specifying a position',valueOne,valueTwo,valueThree);
        };
        var displayPEChooser = function (holder,valueOne,valueTwo,valueThree,valueFour){
            appendProteinEffectsButtons (holder,'peHolder','proteinEffect','all_functions_checkbox','protein_truncating_checkbox','missense_checkbox',
                'missense-options','polyphenSelect','siftSelect','condelSelect','synonymous_checkbox','noncoding_checkbox',
                'protein effect help title','everything there is to say about a protein effect',valueOne,valueTwo,valueThree,valueFour);
        };
        var displayDSChooser = function (){
            $('#dataSetChooser').show ();
        };
        var displayDataSetChooser = function (initialValue){
            var phenotypeComboBox = UTILS.extractValsFromCombobox(['phenotype']);
            mpgSoftware.variantWF.retrieveDataSets(phenotypeComboBox['phenotype']);
            $('#dataSetChooser').show ();
        };



        /***
         * public
         */
        var forceToPropertySelection = function (sectionName, equivalence, value){
            var labelId = sectionName+'___nameId';
            var equivalenceId = sectionName+'___equivalenceId';
            var valueId = sectionName+'___valueId';
           // $("#"+labelId).text (sectionName);
            $("#"+equivalenceId).val (equivalence);
            $("#"+valueId).val (value);
        };
        var forceToPhenotypeSelection = function (phenotypeComboBox,dataset){
            mpgSoftware.variantWF.retrieveDataSets(phenotypeComboBox,dataset);
            $('#dataSetChooser').show ();
            $('#filterInstructions').text('Choose a sample set  (or click GO for all sample sets):');
            mpgSoftware.variantWF.currentInteractivityState(0);  // but the other widgets know that the user is working on a single filter
            mpgSoftware.variantWF.whatToDoNext(1);
        };
        var respondToPhenotypeSelection = function (){
            var phenotypeComboBox = UTILS.extractValsFromCombobox(['phenotype']);
            // phenotype is changed.  Before we get to the asynchronous parts let's wipe out the properties
            $('.propertyHolderBox').remove();
            forceToPhenotypeSelection(phenotypeComboBox['phenotype']);
        };

        var forceToDataSetSelection = function (dataSetComboBox,phenotypeComboBox,property,equiv,value ){
            mpgSoftware.variantWF.retrievePropertiesPerDataSet(phenotypeComboBox,dataSetComboBox,property,equiv,value);
            $('#filterInstructions').text('Add filters, if any:');
            mpgSoftware.variantWF.currentInteractivityState(0);
            mpgSoftware.variantWF.whatToDoNext(2);
        };

        var respondToDataSetSelection = function (){
            var dataSetComboBox = UTILS.extractValsFromCombobox(['dataSet']);
            var phenotypeComboBox = UTILS.extractValsFromCombobox(['phenotype']);
            forceToDataSetSelection(dataSetComboBox["dataSet"],phenotypeComboBox["phenotype"]);
        };


        var forceRequestForMoreFilters = function (selection,holder,valueOne,valueTwo,valueThree,valueFour){
            switch (selection){
//                case 'pvalue':displayPVChooser(holder,valueOne,valueTwo);
//                    break;
//                case 'oddsratio':displayORChooser(holder,valueOne,valueTwo);
//                    break;
//                case 'effectsize':displayESChooser(holder,valueOne,valueTwo);
//                    break;
                default:
                    appendValueWithEquivalenceChooser (holder,selection.prop+'Holder',selection,
                        'help title','everything there is to say to help you out','lessThan','');
                    break;
            }
        };
        var parseCustomFilter = function(filterDefinition){
            var returnValue = {phenotype:"",dataset:"",property: "",equiv:"",value:"", success: true};
            if (typeof filterDefinition !== 'undefined')  {
                var mainSplit  =   filterDefinition.split("]");
                if (mainSplit.length === 2) {
                    var secondarySplit =  (mainSplit[0]).split("[");
                    returnValue.phenotype = secondarySplit [0];
                    returnValue.dataset = secondarySplit [1];
                    var partTwo = mainSplit[1];
                    if (partTwo.indexOf("<") > -1){
                        var  equivalencePosition = partTwo.indexOf("<");
                        returnValue.property  = partTwo.substring(0,equivalencePosition);
                        returnValue.value  = partTwo.substring(equivalencePosition+1);
                        returnValue.equiv  = "lessThan"
                    } else if (partTwo.indexOf(">") > -1){
                        var  equivalencePosition = partTwo.indexOf(">");
                        returnValue.property  = partTwo.substring(0,equivalencePosition);
                        returnValue.value  = partTwo.substring(equivalencePosition+1);
                        returnValue.equiv  = "greaterThan" ;
                    } else if (partTwo.indexOf("=") > -1){
                        var  equivalencePosition = partTwo.indexOf("=");
                        returnValue.property  = partTwo.substring(0,equivalencePosition);
                        returnValue.value  = partTwo.substring(equivalencePosition+1);
                        returnValue.equiv  = "equalTo" ;
                    }   else { returnValue.success = false; }
                } else { returnValue.success = false; }
            }  else { returnValue.success = false; }
            return  returnValue;
        } ;
        var respondToReviseCustomFilter = function(filterDefinition){
            var parsedFilter =  parseCustomFilter (filterDefinition);
            if (parsedFilter.success) {
                $('#phenotype').val(parsedFilter.phenotype)  ;
                $('#dataSet').val(parsedFilter.dataset) ;
                forceToPhenotypeSelection(parsedFilter.phenotype,parsedFilter.dataset);
                forceToDataSetSelection(parsedFilter.dataset,parsedFilter.phenotype,parsedFilter.property,parsedFilter.equiv,parsedFilter.value );

            }
        };
        var respondToReviseFilters = function (selection,valueOne,valueTwo,valueThree,valueFour){
            var holder = $('#filterHolder');
         //   var choice = $("#additionalFilters option:selected");
            forceRequestForMoreFilters (selection, holder,valueOne,valueTwo,valueThree,valueFour);
        };


        var respondToRequestForMoreFilters = function (){
            var holder = $('#filterHolder');
            var choice = $("#additionalFilters option:selected");
            var selection = choice.val();
            if (typeof selection !== 'undefined') {
                forceRequestForMoreFilters(selection, holder);
            }
        };
        var addOnePropertyFilter = function (holder,selection){
            if ((typeof selection !== 'undefined') &&
                (typeof holder !== 'undefined'))  {
                forceRequestForMoreFilters (selection, holder);
            }
        };
        var requestToAddFilters = function (){
            var holder = $('#filterHolder');
            var choice = $("#additionalFilters option:selected");
            var selection = choice.val();
            addOnePropertyFilter (holder,selection);
        };
        return {
            forceToPhenotypeSelection:forceToPhenotypeSelection,
            respondToPhenotypeSelection:respondToPhenotypeSelection,
            forceToDataSetSelection:forceToDataSetSelection,
            respondToDataSetSelection:respondToDataSetSelection,
            respondToRequestForMoreFilters:respondToRequestForMoreFilters,
            displayDataSetChooser:displayDataSetChooser,
            respondToReviseFilters:respondToReviseFilters,
            respondToReviseCustomFilter:respondToReviseCustomFilter,
            requestToAddFilters:requestToAddFilters,
            addOnePropertyFilter:addOnePropertyFilter,
            appendValueWithEquivalenceChooser:appendValueWithEquivalenceChooser,
            forceToPropertySelection:forceToPropertySelection
        }

    }());


})();
