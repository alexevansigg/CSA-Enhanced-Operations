  /*  File: CSA-Enhanced-Operations.js
        Authour: Alex Evans
        Description: Contains the datatables initialization and accompanying event listeners for the Enhanced Operations page.
    */
  /* Initialize the common variables */
  var currentVersion, myRow, rowData, columns, dataUrl, openSub, openInst, modifySub, viewTop, cancelSub, deleteSub, config, cookieSetup;
  currentVersion = 0.5;
  cookieSetup = readCookie(setup.CACHE_NAME);

  /* when the cookie doesnt exist or the version is superceded override it */
  if (!cookieSetup || JSON.parse(cookieSetup).currentVersion != currentVersion) {
    setup.currentVersion = currentVersion;
     
    /* Clone the column data to the column classes */
    for(var i in setup.COLUMNS) {
       var colClass= setup.COLUMNS[i].class;
       var colData = setup.COLUMNS[i].data;
       setup.COLUMNS[i].class = (typeof(colClass) != 'undefined') ? colClass + " " + colData : colData;
    } 
    /* Add the Options Row */
    setup.COLUMNS.push({"title":"Options","data":"options","class":"options all"});

    cookieSetup = createCookie(setup.CACHE_NAME, JSON.stringify(setup), setup.CONFIG_CACHE);
    cookieSetup = readCookie(setup.CACHE_NAME);
  }


  /* Copy the initial config to the setup param */
  config = JSON.parse(cookieSetup);



  /* Read the Default Setup Params */
  config.REQUIRE_CONFIRMATION = (config.REQUIRE_CONFIRMATION) ? "checked" : "";
  config.SHOW_RETIRED = (config.SHOW_RETIRED) ? "checked" : "";
  config.ADVANCED_SEARCH = (config.ADVANCED_SEARCH) ? "checked" : "";
  config.URL_PARAMS = (config.SHOW_RETIRED) ? "?retired=true" : "";

  // Some Handlers for Cookies
  function createCookie(name, value, days) {
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          var expires = "; expires=" + date.toGMTString();
      } else var expires = "";
      document.cookie = name + "=" + value + expires + "; path=/";
  }

  function readCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
  }

  function eraseCookie(name) {
      createCookie(name, "", -1);
  }

  /* This function will convert the JSON into CSV */
  function JSON2CSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '', line = '';
        /*Add Labels*/
        var head = array[0];
            for (var index in array[0]) {
                var value = index + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
      
        line = line.slice(0, -1);
        str += line + '\r\n';
   

    for (var i = 0; i < array.length; i++) {
        var line = '';

          //Quote cell entry
            for (var index in array[i]) {
                var value = array[i][index] + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;
    
}
/* function to get Column index by class */
function getColumnIndexesWithClass( columns, className ) {
    var indexes = [];
    $.each( columns, function( index, columnInfo ) {
        var re = '/\b'+columnInfo.class+'\b/';
        if ( re.match(  className) ) {
          indexes.push( index );
        }

    } );
 
    return indexes;
}

/* This function makes a download link to the CSV */
 function download(content, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    return navigator.msSaveBlob(new Blob([content], { type: mimeType }),     fileName);
  } else if ('download' in a) { //html5 A[download]
    a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    setTimeout(function() {
      a.click();
      document.body.removeChild(a);
    }, 66);
    return true;
  } else { //do iframe dataURL download (old ch+FF):
    var f = document.createElement('iframe');
    document.body.appendChild(f);
    f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

    setTimeout(function() {
      document.body.removeChild(f);
    }, 333);
    return true;
  }
}

  $(document).ready(function() {
     
      
      /* Builds a direct Link to a Subscription Page in Operations Tab */
      function makeSubLink(subId) {
          return "<a class='btn btn-default  btn-sm' type='button' data-toggle='tooltip' data-placement='top' title='Open Subscription' href='/csa/operations/index.jsp#subscription/" + subId + "/overview' target='new'><span class='glyphicon glyphicon-share-alt' aria-hidden='true'></span></a>"
      }
      opsTable = $('#opsTable').DataTable({
          responsive: true,
          stateSave:  true,
          colReorder:  true,
          autoWidth: false,
          lengthMenu: [
              [10, 25, 50, -1],
              ["10", "25", "50", "All"]
          ],
          // getIPs is returns a JSON Array with one object for each Entry Optionally if retired default is on the add retired subscriptions to default url
          ajax: config.DATA_URL + config.URL_PARAMS,
      
          // Columns are defined above.
          columns: config.COLUMNS,
          buttons: [
            { text: '<span class="glyphicon glyphicon-eye-open"></span>',
              titleAttr: 'Set Column Visibility',
              extend: 'colvis'
            },
            { text: '<span class="glyphicon glyphicon-copy"></span>',
              titleAttr: 'Copy to Clipboard',
              extend: 'copyHtml5'  
            },
            { text: '<span class="glyphicon glyphicon-send"></span>',
              titleAttr: 'Export as CSV',
              title:'Subscriptions',
              extend: 'csvHtml5'
            },
            { text:'<span class="glyphicon glyphicon-refresh"></span>',
               titleAttr: 'Reload Data',
              action: function ( e, dt, node, config ) {
                $(".glyphicon-refresh").addClass("gly-spin");
                 dt.ajax.reload( function(){
                  $(".glyphicon-refresh").removeClass("gly-spin");
                 });
              }
            },
            { text: '<span class="glyphicon glyphicon-saved"></span>',
              titleAttr: 'Restore Default Layout',
              action: function ( e, dt, node, config ) {
                //Clear the Session and Reload
                dt.state.clear();
                cookieSetup = createCookie(setup.CACHE_NAME, JSON.stringify(setup), setup.CONFIG_CACHE);
                window.location.reload();
              }
            },
            { text:'<span class="glyphicon glyphicon-question-sign"></span>',
              titleAttr:'About Plugin',
              action: function ( dt, node ) {
                $('#helpModal').modal();
              }
            },
            { text:'<span class="glyphicon glyphicon-fullscreen"></span>',
              titleAttr:'Go Fullscreen',
              action: function ( e, dt, node, config ) {
                window.parent.$("iframe").css({
                  "position": "fixed",
                  "top": 0
                });
               node.hide().next().show();
               //parent.location.href= window.location.href;
              }
            },
            { text:'<span class="glyphicon glyphicon-resize-small"></span>',
              titleAttr:'Minimize Table',
              init: function(dt, node){  node.hide(); },
              action: function ( e, dt, node, config ) {
                window.parent.$("iframe").css({
                  "position": "relative",
                  "top": 0
                 });
                node.hide().prev().show();
                //window.location.href="/csa/dashboard/index.jsp/dashboard/CSA-Enhanced-Operations"
              }
            }
           ],
          /* Toolbar and Refresh are custom components added for showing retired artifacts and refreshing the table*/
          dom: 'lr<"toolbar">fBtip',
          columnDefs: [
              // This Adds dynamic links to the the Options column.
              {
                  "targets": getColumnIndexesWithClass(config.COLUMNS, "options"),
                  "data": "options",
                  "render": function(data, type, full, meta) {

                      /* Builds a direct Link to a Service Instance Page in MPP (Requires Consumer Admin Impersonation) */
                      openInst = (config.ENABLE_CONSUMER_ADMIN_LINKS) ? "<a class='btn btn-primary btn-sm openInst' type='button' data-toggle='tooltip' data-placement='top' title='Open Instance (MPP)' href='" + config.MPP_HOST + "myservice/" + full.inst_id + "/catalog/" + full.cat_id + "?fromSub=" + full.DT_RowId + "&onBehalf=" + full.user + "' target='new'><span class='glyphicon glyphicon-share-alt' aria-hidden='true'></span></a>" : "";

                      /* Builds a direct Link to a Subscription Modification Page in MPP (Requires Consumer Admin Impersonation)  */
                      modifySub = (config.ENABLE_CONSUMER_ADMIN_LINKS) ? "<a class='btn btn-primary btn-sm' type='button' data-toggle='tooltip' data-placement='top' title='Modify Subscription (MPP)' href='" + config.MPP_HOST + "subscription/" + full.DT_RowId + "/modify?onBehalf=" + full.user + "' target='new'><span class='glyphicon glyphicon-edit' aria-hidden='true'></span></a>" : "";

                      /* Builds a direct Link to Service Topology View in MPP (Requires Consumer Admin Impersonation) */
                      viewTop = (config.ENABLE_CONSUMER_ADMIN_LINKS) ? "<a class='btn btn-primary btn-sm viewTop' type='button' data-toggle='tooltip' data-placement='top' title='View Topology (MPP)' href='" + config.MPP_HOST + "topology/?id=" + full.inst_id + "' target='new'><span class='glyphicon glyphicon-th-large' aria-hidden='true'></span></a>" : "";

                      /* Makes Link to Cancel Subscription using CSA Legacy Rest API */
                      cancelSub = (config.ENABLE_CANCEL_LINKS) ? "<button class='btn btn-sm btn-danger cancelSub' type='button' data-toggle='tooltip' data-placement='top' title='Cancel Subscription'><span class='glyphicon glyphicon-remove-sign' aria-hidden='true'></span></button>" : "";

                      /*Makes a LInk to Delete a Subscription using CSA Legacy REST API */
                      deleteSub = (config.ENABLE_DELETE_LINKS) ? "<button class='btn btn-sm btn-danger deleteSub' type='button' data-toggle='tooltip' data-placement='top' title='Delete Subscription'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button>" : "";

                      /* Makes a link to resume the subscription  */
                      resumeSub = (config.ENABLE_RESUME_LINKS) ? "<button class='btn btn-sm btn-warning resumeSub' type='button' data-toggle='tooltip' data-placement='top' title='Resume Subscription'><span class='glyphicon glyphicon-repeat' aria-hidden='true'></span></button>" : "";

                      /* Dont Return Any Options for Retired Subscriptions */
                      if (full.artifact_state == "Retired") {
                          return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + makeSubLink(full.DT_RowId) + "</div></div>";
                      }
                      /* Paused Subs can cancel and resume but Not delete */
                      else if (full.lifecycle_status == "Transition paused") {
                          return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + makeSubLink(full.DT_RowId) + openInst + modifySub + viewTop + resumeSub + cancelSub + "</div></div>";
                      }
                      /* Active Subs get all options except Delete */
                      else if (full.inst_state == "Active" || full.inst_state == "Cancel Failed" || full.inst_state == "Public Action Failed") {
                          return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + makeSubLink(full.DT_RowId) + openInst + modifySub + viewTop + cancelSub + "</div></div>";
                      }
                      /* If its not active then we only show the delete subscription button if the Instance is Canceled and we don't show the Cancel Button*/
                      else {
                          return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + makeSubLink(full.DT_RowId) + openInst + modifySub + viewTop + (full.inst_state == "Canceled" ? deleteSub : "") + "</div></div>";
                      }
                  }
              }, {
                  /* Render Icon Imange or N/A */
                  "targets": getColumnIndexesWithClass(config.COLUMNS, "icon_url"),
                  "type": "string",
                  "render": function(data, type, full, meta) {
                      return (data == null) ? '<span class="label label-info">N/A</span>' : '<img alt="instance icon" class="img-thumbnail" src="' + data + '" aria-hidden="true" />';
                  }
              }, {
                  /* Render only a friendly version of the Group Name not the full DN */
                  "targets": getColumnIndexesWithClass( config.COLUMNS, "owner" ),
                  "render": function(data, type, full, meta) {
                      if (data == null) {
                          return '<span class="label label-info">N/A</span>';
                      } else {
                          return '<span class="label label-primary" title="' + data +
                              '"><span class="glyphicon glyphicon-user"></span> ' + data.split(",")[0].substring(3) + '</span>';
                      }
                  }
              }, {
                  /* Render N/A if no End Date exists */
                  "targets": getColumnIndexesWithClass( config.COLUMNS, "end_date" ),
                  "render": function(data, type, full, meta) {
                      return (data == null) ? '<span class="label label-info">N/A</span>' : data;
                  }
              }, {
                  /* Render Label Color based on Subscription Status*/
                  "targets": getColumnIndexesWithClass( config.COLUMNS, "sub_status" ),
                  "render": function(data, type, full, meta) {
                      if (data == "Cancelled") {
                          return '<span class="label label-danger">' + data + '</span>';
                      } else if (data == "Active") {
                          return '<span class="label label-success">' + data + '</span>';
                      } else {
                          return '<span class="label label-primary">' + data + '</span>';
                      }
                  }
              }, {
                  /* Render Label Color based on Instance State*/
                  "targets": getColumnIndexesWithClass( config.COLUMNS, "inst_state" ),
                  "render": function(data, type, full, meta) {
                      if (data == "Cancel Failed" || data == "Failed") {
                          return '<span class="label label-danger">' + data + '</span>';
                      } else if (data == "Active") {
                          return '<span class="label label-success">Online</span>';
                      } // Rename Active to Online
                      else if (data == "Canceled") {
                          return '<span class="label label-default">Offline</span>';
                      } else if (full.lifecycle_status == "Transition paused") {
                          return '<span class="label label-warning">' + data + ' - Paused</span>';
                      } else {
                          return '<span class="label label-warning">' + data + '</span>';
                      }
                  }
              }, {
                  /* Render Not retired if Active */
                  "targets": getColumnIndexesWithClass( config.COLUMNS, "artifact_state" ),
                  "render": function(data, type, full, meta) {
                      return (data == "Active") ? '<span class="label label-success">Not Retired</span>' : '<span class="label label-danger">' + data + '</span>';
                  }
              }
          ],
      });

$('#opsTable').on( 'column-visibility.dt', addSearchBar);
   function addSearchBar(){
    
      $("#opsTable thead tr.singleSearch").remove();
      $('#opsTable thead').append("<tr class='singleSearch'></tr>");

      opsTable.columns().every(function(){
      /*Add the Search only to the visible columns */
        if(this.visible() && (!$(this.header()).hasClass("none"))){
            console.log("Search:",this.search());
            var header = $(this.header());
            var title = this.search() || header.text();
            header.parent().next()
            .append('<th><input type="text" data-column-index="'+this.index()+'" placeholder="Search '+header.text() +'" value="' + this.search() + '" class="form-control input-sm" /></th>' );
        }
      });
    };
      
      /* Delegated Event listener to capture change on Advancded Search */
      $('#opsTable').on( 'keyup change', "tr.singleSearch input", function () {
        var index = $(this).data("column-index");
        if ( opsTable.columns(index).search() !== $(this).value ) {
          opsTable.columns(index)
          .search( this.value )
          .draw();
          $(this).focus();
        }
      });
      

      /* Fixed Header disabled as not working nicely with responsive table */
      if (config.USE_FIXED_HEADER) {
          new $.fn.dataTable.FixedHeader(opsTable);
      }

      $("div.dt-buttons").addClass("pull-right");
      $("div.dt-buttons a").data("placement","bottom");

      /* Add the Show/Hide Retired buttons */
      $("div.toolbar").addClass("pull-left")
          .append('<input type="checkbox" ' + config.SHOW_RETIRED + ' data-toggle="toggle" data-size="small" id="retired">')
          .append('<input type="checkbox" ' + config.REQUIRE_CONFIRMATION + ' data-toggle="toggle"  data-size="small"  id="reqConfirm" >')
          .append('<input type="checkbox" ' + config.ADVANCED_SEARCH + ' data-toggle="toggle"  data-size="small"  id="advSearch" >');

      /* Set Bootstrap Toggle on Retired Checkbox */
      $('#retired').bootstrapToggle({
          on: '<i class="glyphicon glyphicon-eye-open"></i> Retired',
          off: '<i class="glyphicon glyphicon-eye-close"></i> Retired',
          style: "toggleMargin"
      });

      /* Set Bootstrap Toggle on Confirmation Checkbox */
      $('#reqConfirm').bootstrapToggle({
          on: '<i class="glyphicon glyphicon-eye-open"></i> Confirm',
          off: '<i class="glyphicon glyphicon-eye-close"></i> Confirm',
          style: 'toggleMargin'
      });


      /* Set Bootstrap Toggle on Confirmation Checkbox */
      $('#advSearch').bootstrapToggle({
          on: '<i class="glyphicon glyphicon glyphicon-zoom-in"></i> Advanced',
          off: '<i class="glyphicon glyphicon glyphicon-zoom-out"></i> Simple',
          style: 'toggleMargin'
      });

      /* Make friendly tooltip on Action Buttons */
      $('#opsTable_wrapper').tooltip({
          container: "body",
          selector: "div.dt-buttons a,[data-toggle='tooltip'],[rel='tooltip']"
      });

      /* Replace the default Search label with a placeholder */
      $("#opsTable_filter input").attr({
              "Placeholder": "Search"
          }).parent().addClass("pull-left").contents()
          .filter(function() {
              return this.nodeType == 3; //Node.TEXT_NODE
          }).remove();

     $("body").on("click", "button.export", function() {
        var jsData = opsTable.rows({"search":"applied"}).data();
        var csvdata =[];
        for (i=0; i < jsData.length; i++){
            csvdata.push(jsData[i]);
        }
        download(JSON2CSV(csvdata), 'subscriptions.csv', 'text/csv'); 
      });

    
          /* On click Resume do MPP API Resume action */
      $("table").on("click", "button.resumeSub", function() {
          myRow = $(this).closest("tr");
          rowData = opsTable.row(myRow).data();
          var url = "/csa/api/service/subscription/" + rowData["DT_RowId"] + "/resume";
          var token = readCookie("x-csrf-token");
          $.ajax({
              type: "POST",
              "url": url,
              headers: {
                  "x-csrf-token": token
              },
              success: function(response) {
                  $("#responseModal").find("div.modal-body").html("Subscription Resumed").end().modal();
              },
              failure: function(response) {
                  $("#responseModal").find("div.modal-body").html("Something went wrong").end().modal();
              }
          });
      });

      /* On Click Cancel Sub check for confirmation otherwise trigger cancellation */
      $("table").on("click", "button.cancelSub", function() {
          myRow = $(this).closest("tr");
          rowData = opsTable.row(myRow).data();
          if ($('#reqConfirm').prop('checked')) {
              var message = "<strong>Are you sure</strong> you want to Cancel the Subscription<span class='label label-warning'>" + rowData["subscription"] + "</span> Belonging to User <span class='label label-warning'>" + rowData["user"] + "</span> ?";
              $("#confirmModal div.modal-body").html("<div class='alert alert-danger' role='alert'>" + message + "</div>")
                  .next().find("button.confirmAction").data("action-type", "cancel");
              $("#confirmModal").modal();
          } else {
              var url = "/csa/api/service/subscription/" + rowData["DT_RowId"] + "/cancel";
              var token = readCookie("x-csrf-token");
              $.ajax({
                  type: "POST",
                  "url": url,
                  headers: {
                      "x-csrf-token": token
                  },
                  success: function(response) {
                      $("#responseModal").find("div.modal-body").html("Subscription Cancelled").end().modal();
                  },
                  failure: function(response) {
                      $("#responseModal").find("div.modal-body").html("Something went wrong").end().modal();
                  }
              });
          }
      });

      /* On Click Cancel Sub check for confirmation otherwise trigger Deletion
      Todo: the X-Auth-Token doesnt seem to work correctly for this action just yet 
      $("table").on("click","button.deleteSub", function(){
         myRow = $(this).closest("tr");
         rowData = opsTable.row(myRow).data();
         if ($('#reqConfirm').prop('checked')) {
           $("#confirmModal div.modal-body").html("<div class='alert alert-danger' role='alert'><strong>Are you sure</strong> you wish to Delete the Subscription<span class='label label-warning'>" + rowData["subscription"] + "</span> Belonging to User <span class='label label-warning'>" + rowData["user"] +"</span> ?</div>")
           .next().find("button.confirmAction").data("action-type","delete");
           $("#confirmModal").modal();
         }else{
           var url = "/csa/api/mpp/mpp-subscription/" + rowData["DT_RowId"];
           var token = readCookie("x-csrf-token");
          
         $.ajax({type:"DELETE","url":url, headers:{"x-csrf-token":token},"data":{"subscriptionid":rowData["DT_RowId"],"X-Auth-Token":XauthToken, "onBehalf":rowData["user"]}, success:function(response){
            $("#responseModal").find("div.modal-body").html("Subscription Cancelled").end().modal();
           }, failure:function(response){
            $("#responseModal").find("div.modal-body").html("Something went wrong").end().modal();  
           }
         });
         }  
       });
       */

      /* On click delete Subscription first check if confirmation is required, otherwise invoke Delete action in action.jsp. 
      */
      $("table").on("click", "button.deleteSub", function() {
          myRow = $(this).closest("tr");
          rowData = opsTable.row(myRow).data();
          if ($('#reqConfirm').prop('checked')) {
              var message = "<strong>Are you sure</strong> that you wish to Delete the Subscription<span class='label label-warning'>" + rowData["subscription"] + "</span> Belonging to User <span class='label label-warning'>" + rowData["user"] + "</span> ?";

              $("#confirmModal div.modal-body").html("<div class='alert alert-danger' role='alert'>" + message + "</div>")
                  .next().find("button.confirmAction").data("action-type", "delete");
              $("#confirmModal").modal();
          } else {
              var url = "pages/action.jsp?action=delete&subId=" + rowData["DT_RowId"] + "&catId=" + rowData["cat_id"];
              $.get(url, function(response) {
                  $("#responseModal").find("div.modal-body").html(response).end().modal();
              });
          }
      });

      /* Generic Confirm button, calls the correct action based on the context. */
      $("body").on("click", "button.confirmAction", function() {
          var myAction = $(this).data("action-type");
          var url = "pages/action.jsp?action=" + myAction + "&subId=" + rowData["DT_RowId"] + "&catId=" + rowData["cat_id"];
          $.get(url, function(response) {
              $("#responseModal").find("div.modal-body").html(response).end().modal();
          });
      });

      /* On Click "Show Retired" reload the datatable with the new source data */
      $('#retired').change(function() {
          config.URL_PARAMS = ($(this).prop('checked')) ? "?retired=true" : "";
          config.SHOW_RETIRED = ($(this).prop('checked'));
          /* Catch this new Config Setting */
          createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
          $(".glyphicon-refresh").addClass("gly-spin");
          opsTable.ajax.url(config.DATA_URL + config.URL_PARAMS)
            .load(function(){
                  $(".glyphicon-refresh").removeClass("gly-spin");
            });
      })

      /* On Click "Use Confirm" reset the confirm flag */
      $('#reqConfirm').change(function() {
          /* Cache this new Config Setting */
          config.REQUIRE_CONFIRMATION = $(this).prop('checked');
          createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
      });
      if (config.ADVANCED_SEARCH) addSearchBar();
      /* if the Advanced search is turned on the cheange the view and update the cookie */
      $('#advSearch').change(function() {
          if ($(this).prop("checked")){
            addSearchBar();
          } else{
             $("tr.singleSearch").remove();
          }
          config.ADVANCED_SEARCH = $(this).prop('checked');
          createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
      });

      /* turn on bootstrap toggle for all checkboxes */
      $('input[type="checkbox"]').bootstrapToggle();
      $("footer").html("<small>v" + currentVersion + "</small>")
  });
