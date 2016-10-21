  /*  File: CSA-Enhanced-Operations.js
        Authour: Alex Evans
        Description: Contains the datatables initialization and accompanying event listeners for the Enhanced Operations page.
    */
  /* Initialize the common variables */
  var currentVersion, myRow, rowData, columns, dataUrl, openSub, openInst, modifySub, viewTop, cancelSub, deleteSub, config, cookieSetup, cv;
  currentVersion = 0.7;
  setup.msgArray = [];

  var opsUtil = {
    init: function(){
      cookieSetup = this.readCookie(setup.CACHE_NAME);
      try{    
        /* Copy the initial config to the setup param */
        cv = JSON.parse(cookieSetup).currentVersion;
      }
      catch (err){
        cv = "x";
     }

      /* when the cookie doesnt exist or the version is superceded override it */
      if (!cookieSetup || cv != currentVersion) {
        setup.currentVersion = currentVersion;
     
         
        /* Clone the column data to the column classes */
        for(var i in setup.COLUMNS) {
           var colClass= setup.COLUMNS[i].class;
           var colData = setup.COLUMNS[i].data;
           setup.COLUMNS[i].class = (typeof(colClass) != 'undefined') ? colClass + " " + colData : colData;
        } 
        /* Add the Options Row */
        setup.COLUMNS.push({"title":"Options","data":"options","class":"options all no-clickable"});
        opsUtil.deleteCookie(setup.CACHE_NAME);
        cookieSetup = opsUtil.createCookie(setup.CACHE_NAME, JSON.stringify(setup), setup.CONFIG_CACHE);
        cookieSetup = opsUtil.readCookie(setup.CACHE_NAME);
      }

      try{
        /* Copy the initial config to the setup param */
        config = JSON.parse(cookieSetup);
      }
      catch (err){
        console.log("Gotcha");
      }

      /* Read the Default Setup Params */
      config.REQUIRE_CONFIRMATION = (config.REQUIRE_CONFIRMATION) ? "checked" : "";
      config.SHOW_RETIRED = (config.SHOW_RETIRED) ? "checked" : "";
      config.ADVANCED_SEARCH = (config.ADVANCED_SEARCH) ? "checked" : "";
      config.URL_PARAMS = (config.SHOW_RETIRED) ? "?retired=true" : "";
    },
    createCookie: function(name, value, days) {
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
          var expires = "; expires=" + date.toGMTString();
      } else var expires = "";
      document.cookie = name + "=" + value + expires + "; path=/";
    },
    deleteCookie: function(name) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    },
    readCookie: function(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') c = c.substring(1, c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    /* Builds a direct Link to a Subscription Page in Operations Tab */
    makeSubLink: function(subId) {
      return "<a class='btn btn-default  btn-sm' type='button' data-toggle='tooltip' data-placement='top' title='Open Subscription' href='/csa/operations/index.jsp#subscription/" 
      + subId + "/overview' target='new'><span class='glyphicon glyphicon-share-alt' aria-hidden='true'></span></a>";
    },
    rebuildCache: function(){
      this.createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
      return this;
    },
    reDrawNotifications: function(){
      $("div.notification-panel").html("");
      for (var i in config.msgArray){
        var html = '<div class="alert alert-' + config.msgArray[i][0] + ' alert-dismissable page-alert" data-notificationIndex="'+ i +'">';    
           html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>';
           html += '<p class="text-left">' + config.msgArray[i][2] + '</p>';
           html += '<p class="text-right"><small>' + config.msgArray[i][1] + '</small></p></div>';
          $(html).prependTo('div.notification-panel');
       };
       return this;
    },
    resetNotificationCount: function(){
       $('.glyphicon-comment span').text(config.msgArray.length);
       return this;
    },
    resumeSubscription: function(subscriptionID){
      $.ajax({
        type: "POST",
        url: "/csa/api/service/subscription/" + subscriptionID + "/resume",
        headers: {
          "x-csrf-token": opsUtil.readCookie("x-csrf-token")
        },
        success: function(response) {
          var newDate = new Date().toLocaleString();
          var notice = ["success",newDate, "<strong>" + subscriptionID + "</strong> subscription was resumed!"];
          config.msgArray.push(notice);
          opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount(); 
        },
        error: function(response) {
          var newDate = new Date().toLocaleString();
          var notice = ["danger",newDate, "<strong>" + subscriptionID + "</strong> subscription was not resumed!"];
          config.msgArray.push(notice);
          opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount();
        }
      });
      return this;
    },
    /* Cancels a subscription using the Consumption API or falling back to legacy API for cancelled Failed subs*/
    cancelSubscription: function(subscriptionID){
      //Use Legacy API for cancel Failed because ConsumptionAPI dont like cancelling failed stuff.
      if(opsTable.row("#"+subscriptionID).data()["inst_state"] == "Cancel Failed"){
        this.legacyCancelSubscription(subscriptionID);
      } else{
        $.ajax({
          type: "POST",
          url: "/csa/api/service/subscription/" + subscriptionID + "/cancel",
          headers: {
              "x-csrf-token": opsUtil.readCookie("x-csrf-token")
          },
          success: function(response) {
            var newDate = new Date().toLocaleString();
            var notice = ["success",newDate, "<strong>" + subscriptionID + "</strong> Subscription cancel request Sent!"];
            config.msgArray.push(notice);
            opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount(); 
          },
          error: function(response) {
            var newDate = new Date().toLocaleString();
            var notice = ["danger",newDate, "<strong>" + subscriptionID + "</strong> subscription cancel request not sent!"];
            config.msgArray.push(notice);
            opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount();
          }
        });
        return this;
      }   
    }, 
    /* Cancels a subscription using hte legacy api method */
    legacyCancelSubscription: function(subscriptionID){
      var cat_id= opsTable.row("#"+subscriptionID).data()["cat_id"];
      var url = "pages/action.jsp?action=Cancel&subId=" + subscriptionID + "&catId=" + cat_id;
      $.get(url, function(response) {
        var newDate = new Date().toLocaleString();
        var notice = ["success",newDate, "<strong>" + subscriptionID + "</strong>" + response];
        config.msgArray.push(notice);
        opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount(); 
      });
      return this;
    }, 
    /* Deletes a subscription using the legacy api method */
    deleteSubscription: function(subscriptionID){
      var cat_id= opsTable.row("#"+subscriptionID).data()["cat_id"];
      var url = "pages/action.jsp?action=delete&subId=" + subscriptionID + "&catId=" + cat_id;
      $.get(url, function(response) {
        var newDate = new Date().toLocaleString();
        var notice = ["success",newDate, "<strong>" + subscriptionID + "</strong>" + response];
        config.msgArray.push(notice);
        opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount(); 
      });
      return this;
    },
    /* The below function controls the buttons to cancel and Delete Multiple subscriptions */
    validateButtons: function(e, dt, type, indexes){
      var selectedRows = opsTable.rows( { selected: true } ).data().toArray();
      /* Check the Subscriptions are owned by a single User */
      var multiUser = selectedRows.some(function(item, idx){ 
        return item.user != selectedRows[0].user 
      }); 
      /* Check valid Status for Cancel */
      var inValidSubstatus = selectedRows.some(function(item, idx){
          return (["Active","In Progress"].indexOf(item.inst_state) == -1) || item.inst_state == "In Progress" && item.lifecycle_status != "Transition paused" 
      });
      /* Check Valid Status for Delete */
      var inValidDeleteSubstatus = selectedRows.some(function(item, idx){
        return item.inst_state != "Canceled"
      });
       /* Check Valid Status for Resume */
      var inValidResumestatus = selectedRows.some(function(item, idx){
        return item.lifecycle_status != "Transition paused"
      });
      /* Toggle Cancel Button */
      if (!multiUser && !inValidSubstatus && (selectedRows.length > 0)) {
        opsTable.buttons([".cancelSelected"]).enable();
      } else{
        opsTable.buttons([".cancelSelected"]).disable();
      }
       /* Toggle Delete Button */
      if (!multiUser && !inValidDeleteSubstatus  && (selectedRows.length > 0) ){
        opsTable.buttons([".deleteSelected"]).enable();
      } else{
        opsTable.buttons([".deleteSelected"]).disable();
      }
      /* Toggle Resume Button */
      if (!multiUser && !inValidResumestatus  && (selectedRows.length > 0) ){
        opsTable.buttons([".resumeSelected"]).enable();
      } else{
        opsTable.buttons([".resumeSelected"]).disable();
      }
    },
    /* Adds the Advanced Search Bar undeneath each column */
    toggleAdvancedSearchBar: function(columns){
      /* Remove the Old Existing Instance of the Search */
      $("#opsTable thead tr.singleSearch").remove();
      /* If its enabled Add it again */
      if (config.ADVANCED_SEARCH){
        $('#opsTable thead').append("<tr class='singleSearch'></tr>");
        opsTable.columns().every(function(){
          var myheader = $(this.header());
          if(this.visible() && (!myheader.hasClass("none")) && myheader.is(":visible")){
            var title = this.search() || myheader.text();
            var newClass = myheader.attr("class").replace("sorting","").replace("none","");
            myheader.parent().next()
            .append('<th class="' + newClass + '"><input type="text" data-column-index="'+this.index()+'" placeholder="Search '+myheader.text() +'" value="' + this.search() + '" class="form-control input-sm" /></th>' );
          }
        });
      }
    },
    /* function to get Column index by class */
    getColumnIndexesWithClass: function( columns, className ) {
      var indexes = [];
      $.each( columns, function( index, columnInfo ) {
          var re = '/\b'+columnInfo.class+'\b/';
          if ( re.match(  className) ) {
            indexes.push( index );
          }
      } );
      return indexes;
    }
  }; 

  opsUtil.init();
  

  $(document).ready(function() {
    opsTable = $('#opsTable').DataTable({
      responsive:   true,
      stateSave:    true,
      colReorder:   true,
      autoWidth:    false,
      deferedRender: true,
      select: {
        style: 'os',
        selector: 'td:not(.no-clickable)'
      },
      fixedHeader: config.USE_FIXED_HEADER, //config.USE_FIXED_HEADER
      lengthMenu: [
          [10, 25, 50, -1],
          ["10", "25", "50", "All"]
      ],
      /* Toolbar and Refresh are custom components added for showing retired artifacts and refreshing the table*/
      dom: 'lr<"toolbar">fBtip',
      // getIPs is returns a JSON Array with one object for each Entry Optionally if retired default is on the add retired subscriptions to default url
      ajax: config.DATA_URL + config.URL_PARAMS,
  
      // Columns are defined above.
      columns: config.COLUMNS,
      buttons: [
       { className:"btn-default notifications",
         text: ' <span class="glyphicon glyphicon-comment"><span class="icon_counter icon_counter_blue">' + config.msgArray.length + '</span></span>',
         titleAttr: 'Messsages',
         action: function ( e, dt, node, config ) {
            $("#wrapper").toggleClass("toggled");
            $("#opsTable").find("thead tr th").css('min-width', '');
            setTimeout(function(){ 
              opsTable.fixedHeader.adjust();
            }, 700);
              opsUtil.reDrawNotifications();
          }
        },
        { className:"btn-warning resumeSelected",
          text: '<span class="glyphicon glyphicon-repeat"></span>',
          titleAttr: 'Resume Selected Subscriptions',
          action: function ( e, dt, node, config ) {
            //Todo: Call function to Resume Selected Subscription
            var selected = opsTable.rows( { selected: true } ).data().toArray();
            var selectedIDs = selected.map(function(a) {return a.DT_RowId;});
            var myResponse;
            for (var i in selectedIDs) {
              opsUtil.resumeSubscription(selectedIDs[i]);
            }
          }
        },
        { className:"btn-danger cancelSelected",
          text: '<span class="glyphicon glyphicon-remove-sign"></span>',
          titleAttr: 'Cancel Selected Subscriptions',
          action: function ( e, dt, node, config ) {
            var selected = opsTable.rows( { selected: true } ).data().toArray();
            var selectedIDs = selected.map(function(a) {return a.DT_RowId;});
            for (var i in selectedIDs) {
              opsUtil.cancelSubscription(selectedIDs[i]);
            }
          }
        },
        { className:"btn-danger deleteSelected",
          text: '<span class="glyphicon glyphicon-trash"></span>',
          titleAttr: 'Delete Selected Subscriptions',
          action: function ( e, dt, node, config ) {
            //Todo: Call function to Delete Selected Subscription
            var selected = opsTable.rows( { selected: true } ).data().toArray();
            var selectedIDs = selected.map(function(a) {return a.DT_RowId;});
            for (var i in selectedIDs) {
              opsUtil.deleteSubscription(selectedIDs[i]);
            }
          }
        },
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
            opsUtil.createCookie(setup.CACHE_NAME, JSON.stringify(setup), setup.CONFIG_CACHE);
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
        columnDefs: [
          // This Adds dynamic links to the the Options column.
            {
                orderable: false,
               
                "targets": opsUtil.getColumnIndexesWithClass(config.COLUMNS, "options"),
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
                        return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + opsUtil.makeSubLink(full.DT_RowId) + "</div></div>";
                    }
                    /* Paused Subs can cancel and resume but Not delete */
                    else if (full.lifecycle_status == "Transition paused") {
                        return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + opsUtil.makeSubLink(full.DT_RowId) + openInst + modifySub + viewTop + resumeSub + cancelSub + "</div></div>";
                    }
                    /* Paused Subs can cancel and resume but Not delete */
                    else if (full.sub_status == "Terminated") {
                        return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + opsUtil.makeSubLink(full.DT_RowId) + openInst + viewTop + cancelSub + "</div></div>";
                    }
                    /* Active Subs get all options except Delete */
                    else if (full.inst_state == "Active" || full.inst_state == "Cancel Failed" || full.inst_state == "Public Action Failed" || full.inst_state == "Modify Failed") {
                        return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + opsUtil.makeSubLink(full.DT_RowId) + openInst + modifySub + viewTop + cancelSub + "</div></div>";
                    }
                    /* If its not active then we only show the delete subscription button if the Instance is Canceled and we don't show the Cancel Button*/
                    else {
                        return "<div class='btn-toolbar' role='toolbar'><div class='btn-group' role='group'>" + opsUtil.makeSubLink(full.DT_RowId) + openInst + modifySub + viewTop + (full.inst_state == "Canceled" ? deleteSub : "") + "</div></div>";
                    }
                }
            }, {
                /* Render Icon Imange or N/A */
                "targets": opsUtil.getColumnIndexesWithClass(config.COLUMNS, "icon_url"),
                "type": "string",
                "render": function(data, type, full, meta) {
                    return (data == null) ? '<span class="label label-info">N/A</span>' : '<img alt="instance icon" class="img-thumbnail" src="' + data + '" aria-hidden="true" />';
                }
            }, {
                /* Render only a friendly version of the Group Name not the full DN */
                "targets": opsUtil.getColumnIndexesWithClass( config.COLUMNS, "owner" ),
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
                "targets": opsUtil.getColumnIndexesWithClass( config.COLUMNS, "end_date" ),
                "render": function(data, type, full, meta) {
                    return (data == null) ? '<span class="label label-info">N/A</span>' : data;
                }
            }, {
                /* Render Label Color based on Subscription Status*/
                "targets": opsUtil.getColumnIndexesWithClass( config.COLUMNS, "sub_status" ),
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
                "targets": opsUtil.getColumnIndexesWithClass( config.COLUMNS, "inst_state" ),
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
                "targets": opsUtil.getColumnIndexesWithClass( config.COLUMNS, "artifact_state" ),
                "render": function(data, type, full, meta) {
                    return (data == "Active") ? '<span class="label label-success">Not Retired</span>' : '<span class="label label-danger">' + data + '</span>';
                }
            }
        ]
    });

    opsTable
      .on( 'column-visibility.dt', opsUtil.toggleAdvancedSearchBar)
      .on( 'responsive-resize', opsUtil.toggleAdvancedSearchBar)
       /* Delegated event listener to capture selection of a new row */
      .on( 'select', opsUtil.validateButtons) 
      .on( 'deselect', opsUtil.validateButtons)
      /* Delegated Event listener to capture change on Advancded Search */
      .on( 'keyup change', "tr.singleSearch input", function () {
        var index = $(this).data("column-index");
        if ( opsTable.columns(index).search() !== $(this).value ) {
          opsTable.columns(index)
          .search( this.value )
          .draw();
          $(this).focus();
        }
      });
   
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

    $('body').on('click',"button.close", function () {
      var index = $(this).parent().attr("data-notificationIndex");
      config.msgArray.splice(index, 1);
      opsUtil.rebuildCache().reDrawNotifications().resetNotificationCount();
    });

    /* Replace the default Search label with a placeholder */
    $("#opsTable_filter input").attr({"Placeholder": "Search"})
    .parent().addClass("pull-left").contents()
    .filter(function() {
        return this.nodeType == 3; //Node.TEXT_NODE
    }).remove();

    
      /* On click Resume do MPP API Resume action */
      $("#opsTable").on("click", "button.resumeSub", function(event) {
          myRow = $(this).closest("tr");
          rowData = opsTable.row(myRow).data();
          if ($('#reqConfirm').prop('checked')) {
            var message = "<strong>Are you sure</strong> you want to Resume the Subscription<span class='label label-warning'>" + rowData["sub_name"] + "</span> Belonging to User <span class='label label-warning'>" + rowData["user"] + "</span> ?";
            $("#confirmModal div.modal-body").html("<div class='alert alert-danger' role='alert'>" + message + "</div>")
                .next().find("button.confirmAction").data("action-type", "cancel");
            $("#confirmModal").modal();
        } else {
        var myResponse = opsUtil.resumeSubscription(rowData["DT_RowId"]);
        }
      });

      /* On Click Cancel Sub check for confirmation otherwise trigger cancellation */
      $("#opsTable").on("click", "button.cancelSub", function() {
          myRow = $(this).closest("tr");
          rowData = opsTable.row(myRow).data();
          if ($('#reqConfirm').prop('checked')) {
              var message = "<strong>Are you sure</strong> you want to Cancel the Subscription<span class='label label-warning'>" + rowData["sub_name"] + "</span> Belonging to User <span class='label label-warning'>" + rowData["user"] + "</span> ?";
              $("#confirmModal div.modal-body").html("<div class='alert alert-danger' role='alert'>" + message + "</div>")
                  .next().find("button.confirmAction").data("action-type", "cancel");
              $("#confirmModal").modal();
          } else {
            opsUtil.cancelSubscription(rowData["DT_RowId"]);
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
      $("#opsTable").on("click", "button.deleteSub", function() {
          myRow = $(this).closest("tr");
          var icon = $(this).find("span");
          rowData = opsTable.row(myRow).data();
          if ($('#reqConfirm').prop('checked')) {
              var message = "<strong>Are you sure</strong> that you wish to <strong>delete</strong> the Subscription <span class='label label-warning'>" 
              + rowData["sub_name"] + "</span> belonging to User <span class='label label-warning'>" + rowData["user"] + "</span> ?";
              $("#confirmModal div.modal-body").html("<div class='alert alert-danger' role='alert'>" + message + "</div>")
                  .next().find("button.confirmAction").data("action-type", "delete");
              $("#confirmModal").modal();
          } else {
             opsUtil.deleteSubscription(rowData["DT_RowId"]);
          }
      });

      /* Generic Confirm button, calls the correct action based on the context. */
      $("body").on("click", "button.confirmAction", function() {
          var myAction = $(this).data("action-type");
          if (myAction == "cancel"){
            opsUtil.cancelSubscription(rowData["DT_RowId"]);
          } 
          else{
            opsUtil.deleteSubscription(rowData["DT_RowId"]);
          }
      });

      /* On Click "Show Retired" reload the datatable with the new source data */
      $('#retired').change(function() {
          config.URL_PARAMS = ($(this).prop('checked')) ? "?retired=true" : "";
          config.SHOW_RETIRED = ($(this).prop('checked'));
          /* Catch this new Config Setting */
          opsUtil.createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
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
          opsUtil.createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
      });
      if (config.ADVANCED_SEARCH) opsUtil.toggleAdvancedSearchBar();
      
      opsTable.buttons([".cancelSelected",".deleteSelected", ".resumeSelected"]).disable();
      
      /* if the Advanced search is turned on then cheange the view and update the cookie */
      $('#advSearch').change(function() {
        config.ADVANCED_SEARCH = $(this).prop('checked');
        opsUtil.toggleAdvancedSearchBar();
        opsUtil.createCookie(setup.CACHE_NAME, JSON.stringify(config), setup.CONFIG_CACHE);
      });

      /* turn on bootstrap toggle for all checkboxes */
      $('input[type="checkbox"]').bootstrapToggle();
      $("footer").html("<small>v" + currentVersion + "</small>")
  });
