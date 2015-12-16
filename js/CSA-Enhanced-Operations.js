  /*  File: audit.js
        Authour: Alex Evans
        Description: Contains the datatables initialization and accompanying event listeners for the Audit/Operation page.
    */
  /* Initialize the common variables */
  var currentVersion, auditDT, myRow, rowData, columns, dataUrl, openSub, openInst, modifySub, viewTop, cancelSub, deleteSub, config, cookieSetup, colvis;
  currentVersion = 0.4;
  cookieSetup = readCookie("auditConf");

  /* when the cookie doesnt exist or the version is superceded override it */
  if (!cookieSetup || JSON.parse(cookieSetup).currentVersion != currentVersion) {
      setup.currentVersion = currentVersion;
      cookieSetup = createCookie("auditConf", JSON.stringify(setup), setup.CONFIG_CACHE);
      cookieSetup = readCookie("auditConf");
  }


  /* Copy the initial config to the setup param */
  config = JSON.parse(cookieSetup);

  /* Read the Default Setup Params */
  config.REQUIRE_CONFIRMATION = (config.REQUIRE_CONFIRMATION) ? "checked" : "";
  config.SHOW_RETIRED = (config.SHOW_RETIRED) ? "checked" : "";
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
        

        /* else {
            for (var index in array[i]) {
                line += array[i][index] + ',';
            }
        } */

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;
    
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
      /*
        Column Header Definitions for audit Table
        Note: The Data fields correlate directly to what is returned in the JSON object of getSubs.jsp
        Note2: The class none will move the column to the drill down.
        Note3: The clsss never will allow for hidden fields.
      */
      columns = [{
          "title": "Subscription Name",
          "data": "sub_name",
          "class": "none"
      }, {
          "title": "Icon",
          "data": "icon_url",
          "class": "csaIcons text-center none",
          "sWidth": "45px"
      }, {
          "title": "Instance Name",
          "data": "inst_name",
          "class": "none"
      }, {
          "title": "Owner Group",
          "data": "owner",
          "class": "text-center none"
      }, {
          "title": "Start Date",
          "data": "start_date",
          "class": "text-center none"
      }, {
          "title": "End Date",
          "data": "end_date",
          "class": "text-center none"
      }, {
          "title": "Subs State",
          "data": "sub_status",
          "class": "text-center none",
          "sWidth": "100px"
      }, {
          "title": "Inst State",
          "data": "inst_state",
          "class": "text-center none"
      }, {
          "title": "Retired Artifact",
          "data": "artifact_state",
          "class": "retired none"
      }, {
          "title": "Instance Id",
          "data": "inst_id",
          "class": "none"
      }, {
          "title": "Subscription Id",
          "data": "DT_RowId",
          "class": "none"
      }, {
          "title": "User",
          "data": "user",
          "class": "none"
      }, {
          "title": "User Common Name",
          "data": "common",
          "class": "none"
      }, {
          "title": "User Email",
          "data": "email",
          "class": "none"
      }, {
          "title": "Catalog Id",
          "data": "cat_id",
          "class": "none"
      }, {
          "title": "Offering Name",
          "data": "offering_name",
          "class": "none"
      }, {
          "title": "Organisation Id",
          "data": "org_id",
          "class": "none"
      }, {
          "title": "Organisation Name",
          "data": "org_name",
          "class": "none"
      }, {
          "title": "Options",
          "data": "options",
          "width": "175px",
          "class": "text-center none"
      }];

      /*Set the visibility of columns*/
      for (col in columns) {
          for (vis in config.VISIBLE) {
              if (columns[col].data == vis && config.VISIBLE[vis]) {
                  columns[col].class = columns[col].class.replace("none", "");
              }
          }
      }

      /* Builds a direct Link to a Subscription Page in Operations Tab */
      function makeSubLink(subId) {
          return "<a class='btn btn-default  btn-sm' type='button' data-toggle='tooltip' data-placement='top' title='Open Subscription' href='/csa/operations/index.jsp#subscription/" + subId + "/overview' target='new'><span class='glyphicon glyphicon-share-alt' aria-hidden='true'></span></a>"
      }
      auditDT = $('#audit').DataTable({
          "responsive": true,
          "lengthMenu": [
              [10, 25, 50, -1],
              [10, 25, 50, "All"]
          ],
          "displayLength": config.DEFAULT_DISPLAY_LENGTH,
          "oSearch": {
              "sSearch": config.SEARCH_TERM
          },
          // getIPs is returns a JSON Array with one object for each Entry Optionally if retired default is on the add retired subscriptions to default url
          "ajax": config.DATA_URL + config.URL_PARAMS,
          // Autowidth false prevents some funny resizing stuff.
          "autoWidth": false,
          // Columns are defined above.
          "columns": columns,
          /* Toolbar and Refresh are custom components added for showing retired artifacts and refreshing the table*/
          "dom": 'lr<"toolbar"><"rightToolbar">ftip',
         
          "columnDefs": [
              // This Adds dynamic links to the the Options column.
              {
                  "targets": -1,
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
                      /* Paused Subs can cancel and resume but No delete */
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
                  "targets": 1,
                  "type": "string",
                  "render": function(data, type, full, meta) {
                      return (data == null) ? '<span class="label label-info">N/A</span>' : '<img alt="instance icon" class="img-thumbnail" src="' + data + '" aria-hidden="true" />';
                  }
              }, {
                  /* Render only a friendly version of the Group Name not the full DN */
                  "targets": 3,
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
                  "targets": 5,
                  "render": function(data, type, full, meta) {
                      return (data == null) ? '<span class="label label-info">N/A</span>' : data;
                  }
              }, {
                  /* Render Label Color based on Subscription Status*/
                  "targets": 6,
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
                  "targets": 7,
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
                  "targets": 8,
                  "render": function(data, type, full, meta) {
                      return (data == "Active") ? '<span class="label label-success">Not Retired</span>' : '<span class="label label-danger">' + data + '</span>';
                  }
              }
          ],
          "fnDrawCallback": function(oSettings) {
              /* If the Length Is changed then change the cache */
              if (config.DEFAULT_DISPLAY_LENGTH != oSettings._iDisplayLength) {
                  config.DEFAULT_DISPLAY_LENGTH = oSettings._iDisplayLength;
                  createCookie("auditConf", JSON.stringify(config), setup.CONFIG_CACHE);
              }
          }
      });

      /* Fixed Header disabled as not working nicely with responsive table */
      if (config.USE_FIXED_HEADER) {
          new $.fn.dataTable.FixedHeader(auditDT);
      }

      /* Add ColVis functionality - Any change to configuration added to cookie */
      colvis = new $.fn.dataTable.ColVis(auditDT, {
          "stateChange": function(iColumn, bVisible) {
              var colData = columns[iColumn].data;
              config.VISIBLE[colData] = bVisible;
              createCookie("auditConf", JSON.stringify(config), setup.CONFIG_CACHE);
          }
      });
      $(colvis.button()).insertAfter('div.rightToolbar');

      /* Ensure the colvis list is rebuilt correctly whenever the button is clicked (to capture visibility changes) */
      $("div.ColVis").on("click", function() {
          colvis.rebuild();
      });

      $("div.colVis, div.rightToolbar").addClass("pull-right");

      /* Add a refresh button to the toolbar */
      $("div.rightToolbar").html("<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'></div></div>");

      /* Add Buttons for Help, Fullscreen and minimize to the table header*/
      $("div.rightToolbar .btn-group")
          .append("<button class='btn btn-default refresh' data-toggle='tooltip' data-placement='bottom' title='Refresh Data'><span class='glyphicon glyphicon-refresh'></span></button>")
          .append("<button class='btn btn-default export' data-toggle='tooltip' data-placement='bottom' title='Export CSV'><span class='glyphicon glyphicon-send'></span></button>") 
          .append("<button class='btn btn-default restore' data-toggle='tooltip' data-placement='bottom' title='Restore Defaults' ><span class='glyphicon glyphicon-saved'></span></button>")
          .append("<button class='btn btn-default help' data-toggle='modal' rel='tooltip' data-target='#helpModal' data-placement='bottom' title='About Plugin'><span class='glyphicon glyphicon-question-sign'></span></button>")
          .append("<button class='btn btn-default fullscreen'  data-toggle='tooltip' data-placement='bottom' title='Go FullScreen'><span class='glyphicon glyphicon-fullscreen'></span></button>")
          .append("<button class='btn btn-default embed' data-toggle='tooltip' data-placement='bottom' title='Minimize Table'><span class='glyphicon glyphicon-resize-small'></span></button>");

      /* Hide the minamize on initial load. */
      $("button.embed").hide();

      /* Add the Show/Hide Retired buttons */
      $("div.toolbar").addClass("pull-left")
          .append('<input type="checkbox" ' + config.SHOW_RETIRED + ' data-toggle="toggle" data-size="small" id="retired">')
          .append('<input type="checkbox" ' + config.REQUIRE_CONFIRMATION + ' data-toggle="toggle"  data-size="small"  id="reqConfirm" >');

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

      /* Make friendly tooltip on Action Buttons */
      $('#audit_wrapper').tooltip({
          "container": "body",
          "selector": "[data-toggle='tooltip'],[rel='tooltip']"
      });

      /* Replace the default Search label with a placeholder */
      $("#audit_filter input").attr({
              "Placeholder": "Search"
          }).parent().contents()
          .filter(function() {
              return this.nodeType == 3; //Node.TEXT_NODE
          }).remove();

      /* On Click Refresh reload the datatable */
      $("body").on("click", "button.refresh", function() {
          auditDT.ajax.reload();
      });

      $("body").on("click", "button.fullscreen", function() {
          window.parent.$("iframe").css({
              "position": "fixed",
              "top": 0
          });
          $(this).hide().next().show();
          //parent.location.href= window.location.href;
      });

      /* On a Restore force override setup to cookie and refresh */
      $("body").on("click", "button.restore", function() {
        cookieSetup = createCookie("auditConf", JSON.stringify(setup), setup.CONFIG_CACHE);
        location.reload();
      });
      
      $("body").on("click", "button.export", function() {
        var jsData = auditDT.rows({"search":"applied"}).data();
        var csvdata =[];
        for (i=0; i < jsData.length; i++){
            csvdata.push(jsData[i]);
        }
        download(JSON2CSV(csvdata), 'subscriptions.csv', 'text/csv'); 
      });

      $("body").on("click", "button.embed", function() {
              window.parent.$("iframe").css({
                  "position": "relative",
                  "top": 0
              });
              $(this).hide().prev().show();
              //window.location.href="/csa/dashboard/index.jsp#dashboard/main/audit"
          })
          /* On click Resume do MPP API Resume action */
      $("table").on("click", "button.resumeSub", function() {
          myRow = $(this).closest("tr");
          rowData = auditDT.row(myRow).data();
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
          rowData = auditDT.row(myRow).data();
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
         rowData = auditDT.row(myRow).data();
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
          rowData = auditDT.row(myRow).data();
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
          createCookie("auditConf", JSON.stringify(config), setup.CONFIG_CACHE);
          auditDT.ajax.url(config.DATA_URL + config.URL_PARAMS).load();
      })

      /* On Click "Use Confirm" reset the confirm flag */
      $('#reqConfirm').change(function() {
          /* Cache this new Config Setting */
          config.REQUIRE_CONFIRMATION = $(this).prop('checked');
          createCookie("auditConf", JSON.stringify(config), setup.CONFIG_CACHE);
      });

      /* search.dt is a built in Datatable event */
      auditDT.on('search.dt', function() {
          config.SEARCH_TERM = auditDT.search();
          createCookie("auditConf", JSON.stringify(config), setup.CONFIG_CACHE);
      });

      /* turn on bootstrap toggle for all checkboxes */
      $('input[type="checkbox"]').bootstrapToggle();
      $("footer").html("<small>v" + currentVersion + "</small>")
  });
