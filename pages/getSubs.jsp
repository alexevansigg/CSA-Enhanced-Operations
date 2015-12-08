<%-- 
  - Author(s): Alexander Evans (Hewlett-Packard)
  - Date: 23/10/2014
  - Copyright Notice: Copyright 2014 Hewlett-Packard Schweiz
  - @(#)
  - Description: getIPs.jsp is a custom servlet that simply pulls the List of IP Entries from the CloudDBConfig Database
  And then Formats them into a JSON jsObject Array to be consumed by the IPAM interface in CSA. It feeds from the same 
  JNDI connection sting as defined in the for the Dynamic Queries used in the Subscriber option modals.
  --%>
<%@ page import="com.hp.csa.web.util.CSAIntegrationHelper" %>
<%@ page import="java.util.*" %>
<%@ page import="javax.sql.*" %>
<%@ page import="net.minidev.json.JSONObject" %>
<%@ page import="net.minidev.json.JSONArray" %>
<%@ page import="net.minidev.json.JSONValue" %>
<%@ page import="org.apache.log4j.Logger"%>
<%@ page import="org.apache.log4j.Level"%>

<%
java.sql.Connection con;
java.sql.ResultSet rs;
java.sql.PreparedStatement pstmt;
DataSource ds;
String jndi;
String netw;
String retiredClause = "Retired";

JSONObject jsObj;
JSONArray jsArr;
JSONObject jsRes;

/* Override the Clause if the retired attribute is sent. */
if(request.getParameterMap().containsKey("retired")){
  if(request.getParameter("retired").equals("true")){
  //Oracle doesnt like blank string so making one up here
    retiredClause ="Yeahaa";
  }
}

con = null;
pstmt = null;
rs = null;

/*
Initialize the logger
*/
Logger log = Logger.getLogger("options.jsp");
log.setLevel(Level.INFO);

jndi = "java:jboss/datasources/csaDS";
try{
  javax.naming.Context ic = new javax.naming.InitialContext();
  ds = (DataSource)ic.lookup(jndi);
  con = ds.getConnection();
}catch(Exception cnfex){              
  log.error(cnfex.getMessage());
}

try{
   
   String sql = "SELECT"
   +" sub_view.subscription_id,"
   +" sub_view.subscription_name,"
   +" inst.uuid as instance_id,"
   +" art.display_name as instance_name,"
   +" sub_view.subscription_start_date,"
   +" sub_view.subscription_end_date,"
   +" sub_view.subcription_owner_group,"
   +" sub_view.subscription_status,"
   +" sub_view.requested_by_user,"
   +" sub_view.requested_by_user_email,"
   +" sub_view.catalog_id,"
   +" subpers.user_name,"
   +" sub_view.organization_name,"
   +" sub_view.service_offering_name,"
   +" cat.display_name as artifact_state,"
   +" cat2.display_name as instance_state,"
   +" cat3.display_name as lifecycle_status,"
   +" art2.icon_url,"
   +" service_offering_name,"
   +" sub_view.organization_name,"
   +" sub_view.organization_id"
   +" FROM rpt_user_subscription_v sub_view"
   +" INNER JOIN csa_service_instance inst ON inst.subscription_id = sub_view.subscription_id"
   +" INNER JOIN csa_artifact art ON inst.UUID = art.UUID"
   +" INNER JOIN csa_artifact art2 ON sub_view.subscription_id = art2.UUID"
   +" LEFT JOIN csa_lifecycle_ex_record le on inst.UUID = le.service_instance_id"
   +" AND le.reverse='0' AND le.callback_pending='1' "
   + "AND le.callback_bean IN ('orderOfferingInitializationCallBack','orderOfferingReservationCallBack','orderOfferingDeploymentCallBack')" 
   +" INNER JOIN csa_category cat ON art.state_id = cat.uuid"
   +" INNER JOIN csa_category cat2 ON inst.service_instance_state_id = cat2.uuid"
   +" LEFT JOIN csa_category cat3 on le.execution_status_id = cat3.uuid"
   +" LEFT JOIN csa_category cat4 on le.execution_state_id = cat4.uuid"
   +" INNER JOIN csa_person subpers ON sub_view.requested_by_user_id = subpers.uuid"
   +" WHERE cat.display_name != ?"
   +" ORDER BY subscription_start_date, le.updated_on DESC";
   

   
   StringBuilder sb = new StringBuilder();
   pstmt = con.prepareStatement(sql);
   // Set the Retired claus to excluded retired entries
   pstmt.setString(1, retiredClause);
   rs = pstmt.executeQuery();
   jsArr = new JSONArray();
    while( rs.next() ){ 
    
      jsObj = new JSONObject();
      jsObj.put("DT_RowId", rs.getString("subscription_id"));
      jsObj.put("sub_name", rs.getString("subscription_name"));
      jsObj.put("inst_name", rs.getString("instance_name"));
      jsObj.put("inst_id", rs.getString("instance_id"));
      jsObj.put("inst_state",rs.getString("instance_state"));
      jsObj.put("artifact_state",rs.getString("artifact_state"));
      jsObj.put("lifecycle_status", rs.getString("lifecycle_status"));
      jsObj.put("owner",rs.getString("subcription_owner_group"));
      jsObj.put("start_date",rs.getString("subscription_start_date"));
      jsObj.put("end_date",rs.getString("subscription_end_date"));
      jsObj.put("sub_status",rs.getString("subscription_status"));
      jsObj.put("user",rs.getString("user_name"));
      jsObj.put("common",rs.getString("requested_by_user"));
      jsObj.put("email",rs.getString("requested_by_user_email"));
      jsObj.put("cat_id",rs.getString("catalog_id"));
      jsObj.put("icon_url",rs.getString("icon_url"));
      jsObj.put("offering_name",rs.getString("service_offering_name"));
      jsObj.put("org_id",rs.getString("organization_id"));
      jsObj.put("org_name",rs.getString("organization_name"));
      jsArr.add(jsObj);

    }
  
    jsRes = new JSONObject();
    jsRes.put("data", jsArr);
    out.println(JSONValue.toJSONString(jsRes));

}catch(Exception e){
  out.println("<div id=\"error\">");
  e.printStackTrace(new java.io.PrintWriter(out));
  out.println("</div>");
}
finally{
	if(rs!=null) rs.close();
	if(con!=null) con.close();
}
%>