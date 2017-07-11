<%-- 
  - Author(s): Alexander Evans (Hewlett Packard Enterprise)
  - Date: 23/10/2015
  - @(#)
  - Description: CSA-Enhanced-Operations.jsp is a custom Servelet designed to make managing CSA subscritpion easier.
  - It makes extensive use of the Datatables library more information can be found at http://datatables.net .
  --%>
<%@ page import="java.util.*" %>
<%
    response.setHeader("Cache-Control", "no-cache"); //HTTP 1.1
    response.setHeader("Pragma", "no-cache"); //HTTP 1.0
    response.setDateHeader("Expires", 0);
%>
<!-- Renive this line if the page doesnt exist in your version of csa -->
<%@include file="/components/pages/partials/user.jsp" %>
  

  <html>
  <head>
    <link rel="icon" href="/csa/static/img/favicon.ico" sizes="32x32 48x48" type="image/vnd.microsoft.icon"><!-- Default CSA Favicon -->
    
    <link rel="stylesheet" href="assets/css/bootstrap.min.css"><!-- bootstrap -->
    <link rel="stylesheet" href="assets/css/dataTables.combined.min.css"> <!-- datatables responsive plugin -->
    <link rel="stylesheet" href="assets/css/bootstrap-toggle.min.css">
    <link rel="stylesheet" type="text/css" media="all" href="css/CSA-Enhanced-Operations.css"><!-- Core style sheet for Audit/Operations plugin -->
    

  <script>
    var setup = <%@include file="setup.json" %>;
  </script>


<style>
body.dragging, body.dragging * {
  cursor: move !important;
}

.dragged {
  position: absolute;
  background: #02b294;
  z-index: 2000;
}

ol.example li.placeholder {
  position: relative;
  /** More li styles **/
}
ol.example li.placeholder:before {
  position: absolute;
  /** Define arrowhead **/
}
i.draggable{
  cursor:move;
}
</style>

<script src="assets/js/jquery.min.js"></script> <!-- jQuery borrowed from CSA -->
<script src="assets/js/bootstrap.min.js"></script><!-- bootstrap borrowed from CSA -->
<script src="assets/js/dataTables.combined.min.js"></script><!-- dataTables from datatables.net -->
<script src="assets/js/bootstrap-toggle.min.js"></script>
<script src="assets/js/jquery-sortable.js"></script>
</head>

<body class="text-center">
    <div class="container-fluid" >
      <div class="row">
        <div class="col-md-12">
          <div class="panel panel-info">
             <div class="panel-heading">Cloud Service Automation - Enhanced Operations Configuration</div>
            <div class="panel-body">
       
      <div class="row">
        <form id="config_form" class="form-horizontal">
        <div class="col-md-6">
         <div class="panel panel-primary">
             <div class="panel-heading">General Config</div>
          <div class="panel-body">
            <div class="form-group">
              <label class="col-sm-4 control-label">MPP Host</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" name="MPP_HOST" placeholder="https://<csahost>:8089/"/>
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">DATA URL</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" name="DATA_URL" placeholder="pages/getSubs.jsp" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Config Cache</label>
              <div class="col-sm-8">
                <input type="number" id="CONFIG_CACHE" name="CONFIG_CACHE" placeholder="0" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">HTTP Cache Name</label>
              <div class="col-sm-8">
                <input type="text" id="CACHE_NAME" name="CACHE_NAME" placeholder="CSA-E-O-Conf" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Default Display Length</label>
              <div class="col-sm-8">
                <input type="number" id="DEFAULT_DISPLAY_LENGTH" name="DEFAULT_DISPLAY_LENGTH" placeholder="25" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Default Search Term</label>
              <div class="col-sm-8">
                <input type="text" id="SEARCH_TERM" name="SEARCH_TERM" placeholder="" class="form-control">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Advanced Search</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="ADVANCED_SEARCH" name="ADVANCED_SEARCH">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Consumer Admin Links</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="ENABLE_CONSUMER_ADMIN_LINKS" name="ENABLE_CONSUMER_ADMIN_LINKS">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Cancel Subscription Button</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="ENABLE_CANCEL_LINKS" name="ENABLE_CANCEL_LINKS">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Resume Subscription Button</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="ENABLE_RESUME_LINKS" name="ENABLE_RESUME_LINKS">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Delete Subscription Button</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="ENABLE_DELETE_LINKS" name="ENABLE_DELETE_LINKS">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Require Confirmation Default</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="REQUIRE_CONFIRMATION" name="REQUIRE_CONFIRMATION">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Show Retired Subscriptions</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="SHOW_RETIRED" name="SHOW_RETIRED">
              </div>
            </div>
            <div class="form-group">
              <label class="col-sm-4 control-label">Used Fixed Header</label>
              <div class="col-sm-8">
                <input type="checkbox" data-toggle="toggle" data-size="small" id="USE_FIXED_HEADER" name="USE_FIXED_HEADER">
              </div>
            </div>
          </div>
        </div>
        </div>
      
        <div class="col-md-6">
          <div class="panel panel-primary">
           <div class="panel-heading">Column Config</div>
          <div class="panel-body">
           

<ul class="list-group text-left" id="columnList">
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Subscription Name</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Icon</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Instance Name</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Owner Group</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Start Date</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> End Date</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Subs State</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Inst State</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Retired Artifact</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Instance Id</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Subscription Id</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> User</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> User Common Name</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> User Email</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Catalog Id</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Offering Name</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Organisation Id</li>
  <li class="list-group-item"><i class="glyphicon glyphicon-resize-vertical draggable"></i> Organisation Name</li>
</ul>

<script>
    jQuery(function($) {
        var panelList = $('#columnList');

        panelList.sortable({
            // Only make the .panel-heading child elements support dragging.
            // Omit this to make then entire <li>...</li> draggable.
            handle: '.glyphicon-resize-vertical', 
            update: function() {
                $('.list-group-item', panelList).each(function(index, elem) {
                     var $listItem = $(elem),
                         newIndex = $listItem.index();

                     // Persist the new indices.
                });
            }
        });
    });

</script>
<!--
   {"title": "Subscription Name",     "data": "sub_name" }, 
        {"title": "Icon",                  "data": "icon_url",          "class":"text-center" },
        {"title": "Instance Name",         "data": "inst_name"},
        {"title": "Owner Group",           "data": "owner",             "class":"text-center"},
        {"title": "Start Date",            "data": "start_date"}, 
        {"title": "End Date",              "data": "end_date",          "class":"none"},
        {"title": "Subs State",            "data": "sub_status",        "class":"text-center"},
        {"title": "Inst State",            "data": "inst_state",        "class":"text-center"},
        {"title": "Retired Artifact",      "data": "artifact_state",    "class":"none text-center"},
        {"title": "Instance Id",           "data": "inst_id",           "class":"none"}, 
        {"title": "Subscription Id",       "data": "DT_RowId",          "class":"none"}, 
        {"title": "User",                  "data": "user" },
        {"title": "User Common Name",      "data": "common",            "class":"none"},
        {"title": "User Email",            "data": "email",             "class":"none"}, 
        {"title": "Catalog Id",            "data": "cat_id",            "class":"none"},
        {"title": "Offering Name",         "data": "offering_name",     "class":"none"},
        {"title": "Organisation Id",       "data": "org_id",            "class":"none"},
        {"title": "Organisation Name",     "data": "org_name",          "class":"none"}


-->

          </div><!--End of Panel Body-->
        </div>
        </div><!--End of Panel -->
      </div><!--End of Row-->




            </div>
          </div>
        </div>
        </div>
      </form>


      <script>

      $("#ENABLE_CONSUMER_ADMIN_LINKS, #ENABLE_CANCEL_LINKS, #ENABLE_RESUME_LINKS, #ENABLE_DELETE_LINKS, #REQUIRE_CONFIRMATION, #SHOW_RETIRED, #USE_FIXED_HEADER, #ADVANCED_SEARCH").bootstrapToggle({
          on: '<i class="glyphicon glyphicon-ok"></i> Enabled',
          off: '<i class="glyphicon glyphicon-remove"></i> Disabled',
          style: "toggleMargin pull-left"
      });


    </script>

<!--
        {
  "MPP_HOST":"https://W2K12CSA420OO:8089/",
  "DATA_URL":"pages/getSubs.jsp",
  "ENABLE_CONSUMER_ADMIN_LINKS":true,
  "ENABLE_CANCEL_LINKS":true,
  "ENABLE_RESUME_LINKS":true,
  "ENABLE_DELETE_LINKS":true,
  "REQUIRE_CONFIRMATION":true,
  "SHOW_RETIRED":false,
  "USE_FIXED_HEADER":true,
  "CONFIG_CACHE":0,
    "CACHE_NAME":"CSA-E-O-Conf",
  "DEFAULT_DISPLAY_LENGTH":25,
  "SEARCH_TERM":"",
    "ADVANCED_SEARCH":true,
    "COLUMNS":[
        {"title": "Subscription Name",     "data": "sub_name" }, 
        {"title": "Icon",                  "data": "icon_url",          "class":"text-center" },
        {"title": "Instance Name",         "data": "inst_name"},
        {"title": "Owner Group",           "data": "owner",             "class":"text-center"},
        {"title": "Start Date",            "data": "start_date"}, 
        {"title": "End Date",              "data": "end_date",          "class":"none"},
        {"title": "Subs State",            "data": "sub_status",        "class":"text-center"},
        {"title": "Inst State",            "data": "inst_state",        "class":"text-center"},
        {"title": "Retired Artifact",      "data": "artifact_state",    "class":"none text-center"},
        {"title": "Instance Id",           "data": "inst_id",           "class":"none"}, 
        {"title": "Subscription Id",       "data": "DT_RowId",          "class":"none"}, 
        {"title": "User",                  "data": "user" },
        {"title": "User Common Name",      "data": "common",            "class":"none"},
        {"title": "User Email",            "data": "email",             "class":"none"}, 
        {"title": "Catalog Id",            "data": "cat_id",            "class":"none"},
        {"title": "Offering Name",         "data": "offering_name",     "class":"none"},
        {"title": "Organisation Id",       "data": "org_id",            "class":"none"},
        {"title": "Organisation Name",     "data": "org_name",          "class":"none"}
        ]
}
-->
        </div>
      </div>
    </div>

