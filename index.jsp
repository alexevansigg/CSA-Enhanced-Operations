<%-- 
  - Author(s): Alexander Evans (Hewlett-Packard)
  - Date: 23/10/2014
  - Copyright Notice: Copyright 2015 Hewlett-Packard 
  - @(#)
  - Description: audit.jsp is a custom Servelet designed to make managing CSA subscritpion easier.
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
    
    <link rel="stylesheet" href="assets/css/bootstrap.min.css"><!-- bootstrap borrowed from CSA -->
    <link rel="stylesheet" href="assets/css/dataTables.combined.css"> <!-- datatables responsive plugin -->
   
    <link rel="stylesheet" href="assets/css/bootstrap-toggle.min.css">

    <link rel="stylesheet" type="text/css" media="all" href="css/CSA-Enhanced-Operations.css"><!-- Core style sheet for Audit/Operations plugin -->
    
    <script>
    var setup = <%@include file="setup.json" %>;
  
   <%
   /*
   Small snippet to read the X-Auth-Token
   Todo: Abstract and clean this up
   */
    Cookie[] cookies = null;
    Cookie cookie = null;
    cookies = request.getCookies();
    if( cookies != null ){
      for (int i = 0; i < cookies.length; i++){
         cookie = cookies[i];
        if (cookie.getName( ).equals("X-Auth-Token")){
          out.print("var XauthToken = '" + cookie.getValue( )+"';");
        } 
      } 
    }
   %>
 
    </script>
    <script src="assets/js/jquery.min.js"></script> <!-- jQuery borrowed from CSA -->
    <script src="assets/js/bootstrap.min.js"></script><!-- bootstrap borrowed from CSA -->
    <script src="assets/js/dataTables.combined.js"></script><!-- dataTables from datatables.net -->
    <script src="assets/js/bootstrap-toggle.min.js"></script>
   
   
    <script type="text/javascript" charset="utf8" src="js/CSA-Enhanced-Operations.js"></script><!-- Core script for Audit/Operations Plugin -->


  </head>
  
  <body class="text-center">
    <div class="container-fluid" >
      <div class="row">
       <div class="col-md-12">
        <!--Place holder for the datatable -->
         <table id="opsTable" class="table table-striped table-bordered table-hover table-condensed" width="100%"></table>
        </div>
      </div>
    </div>

    <!-- Modal for Action Confirmation -->
    <div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title" id="myModalLabel">Confirm Action</h4>
          </div>
          <div class="modal-body"></div><!--Content injected here by bootstrap model javascript --> 
          <div class="modal-footer">
            <button type="button" class="btn btn-default cancel" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary confirmAction" data-toggle='modal'  data-dismiss="modal">Confirm</button>
          </div>
        </div>
      </div>
    </div><!-- End of confirmModal -->

    <!-- Modal for Response -->
    <div class="modal fade" id="responseModal" tabindex="-1" role="dialog" aria-labelledby="responseModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title" id="responseModalLabel">Response</h4>
          </div>
          <div class="modal-body">  </div><!--Content injected here by bootstrap model javascript --> 
          <div class="modal-footer">
             <button type="button" class="btn btn-info refresh" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div><!-- End of responseModal -->


    <!-- Modal for Help -->
    <div class="modal fade" id="helpModal" tabindex="-1" role="dialog" aria-labelledby="helpModalLabel" aria-hidden="true">
      <div class="modal-dialog" style="width:80%">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title" id="helpModalLabel">Audit / Operations (Experimental) Help</h4>
          </div>
          <div class="modal-body text-left">
            <p> This tool is designed to aid with common auditing and operations tasks which in a more efficient fashion than tracing logs and using operations tabs.<p>
            <p> By default all subscriptions across all consumer organisations. for each subscription there are the following capabilites</p>
            <ul>
              <li><b>Open Operations tab</b>- Clicking this will open the Entry for the given subscription under the operations tab</li>
              <li><b>Open Modify Subscription</b> - Clicking this will open the subscription modification page in the MPP (Requires Consumer Admin Login)</li>
              <li><b>Open Service Instance</b> - Clicking this will open the Service Instance page in the MPP (Requires Consumer Admin Login)</li>
              <li><b>Open Service Topology</b> - Opens the MPP Topology view of a Service Instance</li>
              <li><b>Cancel Subscription</b> - (Possible also for Cancel Failed Subscriptions)</li>
              <li><b>Resume Subscription</b> - (Possible only for subscriptions with Provisioning errors and Pause on Error enabled)</li>
              <li><b>Delete Subscription</b> - (Possible only for Offline Subscriptions)</li>
            </ul>

            <p>Additionally there are the following controls</p>
            <ul>
              <li><b> Toggle Show retired subscriptions</b> - For these you can also link the the Operations tab page</li>
              <li><b> Toggle Confirmation</b> - This turns of the warning when you want the cancel/delete subscriptions quickly</li>
              <li><b> Table Search</b> - Generic Search which filters on all fields included in the Datatable</li>
              <li><b> Refresh Datatable</b> - Refresh table with dataset, maintainign search critera</li>
              <li><b> Additional Meta</b> - Click the Down arrow next to the Subscription name to view additional Meta data</li>
            </ul>
     <div class="alert alert-warning" role="alert"><b>Note:</b> that this is an Experimental feature which is provided as an unsupported plugin to the CSA MAnagement Console</div>     
          </div>
          <div class="modal-footer">
             <button type="button" class="btn btn-primary refresh" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div><!-- End of help Model -->
<footer></footer>
  </body>
</html>
