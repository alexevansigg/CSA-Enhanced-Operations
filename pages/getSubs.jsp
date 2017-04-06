<%-- 
  - Author(s): Alexander Evans (Hewlett-Packard)
  - Date: 21/10/2016
  - @(#)
  - Description: getSubs.jsp is a custom servlet which will query a list of subscriptions from CSA and format it into a json object
  - you can pass the parameter retired=false to omit the retired subscriptions from the json object (this can drastically reduce the 
  - response size/time.
  --%>
<%@ page import="com.hp.csa.web.util.CSAIntegrationHelper" %>
<%@ page import="java.util.*" %>
<%@ page import="javax.sql.*" %>
<%@ page import="net.minidev.json.JSONObject" %>
<%@ page import="net.minidev.json.JSONArray" %>
<%@ page import="net.minidev.json.JSONValue" %>
<%@ page import="org.apache.log4j.Logger"%>
<%@ page import="org.apache.log4j.Level"%>
<%@ page import="java.io.FileInputStream "%>
<%@ page import="java.io.File "%>

<%
java.sql.Connection con;
java.sql.ResultSet rs;
java.sql.PreparedStatement pstmt;
java.sql.ResultSetMetaData rsmd;

DataSource ds;
String jndi;
String netw;
String columnName;
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
** Initialize the logger
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
String sqlFile = "getSubs.sql";
String sql;
try{

  File jsp = new File(request.getSession().getServletContext().getRealPath(request.getServletPath()));
  File dir = jsp.getParentFile();
  File file = new File(dir + "/sql/" + sqlFile);
  FileInputStream fis = new FileInputStream(file);
  byte[] data = new byte[(int) file.length()];
  fis.read(data);
  fis.close();
  sql = new String(data, "UTF-8");
   
   
   pstmt = con.prepareStatement(sql);
   // Set the Retired claus to excluded retired entries
   pstmt.setString(1, retiredClause);
   rs = pstmt.executeQuery();

   // Get the Column headers
   rsmd = rs.getMetaData();
   int columnCount = rsmd.getColumnCount();

   jsArr = new JSONArray();
    while( rs.next() ){ 

      jsObj = new JSONObject();
      /*
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

      */

      /* Iterate over each column and add it to the json Object */
      for (int i = 1; i <= columnCount; i++ ) {
        /* capitalize the column names to standardize with different RDBMS systems */
        columnName = rsmd.getColumnName(i).toUpperCase();
        jsObj.put(columnName, rs.getString(columnName));
      }

      /* Add the JSON object which represents a single row to the JSON Array */
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