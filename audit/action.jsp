<%@ page import="java.util.*" %>
<%@ page import="org.apache.log4j.Logger"%>
<%@ page import="org.apache.log4j.Level"%>
<%@ page import="java.lang.RuntimeException"%>
<%@ page import="java.io.*"%>
<%@ page import="org.w3c.dom.*"%>
<%@ page import="org.apache.commons.codec.binary.Base64"%>
<%@ page import="org.apache.commons.lang.StringEscapeUtils"%>
<%@ page import="org.apache.commons.httpclient.Header" %>
<%@ page import="org.apache.commons.httpclient.HttpClient"%>
<%@ page import="org.apache.commons.httpclient.UsernamePasswordCredentials"%>
<%@ page import="org.apache.commons.httpclient.auth.AuthScope"%>
<%@ page import="org.apache.commons.httpclient.methods.PostMethod"%>
<%@page trimDirectiveWhitespaces="true" %>
<%

/* Initialize the variables*/
String action;
String subId;
String catId;
String userId;
String userpass;
String url;
String body;
String myResponse;  // Will hld the response body from the cancel request
int status;         // Will hold the http response status from cancel request
HttpClient client;
Logger log;
StringEscapeUtils esc;

/* Validate required Inputs */
if (request.getParameterMap().containsKey("action")){
  action = request.getParameter("action");
} else{
  out.println("action is required");
  return;
}
if (request.getParameterMap().containsKey("subId")){
  subId = request.getParameter("subId");
} else{
  out.println("subId is required");
  return;
}
if (request.getParameterMap().containsKey("catId")){
  catId = request.getParameter("catId");
} else{
  out.println("catId is required");
  return;
}

/* Set Fixed values and Build url & request Body */
userId     = "6BC7CE65B5F74D08AA29C8FC40616451"; // The ooInboundUser ID

url = "";
body="";

if (action.equals("delete")){
  url        = "https://localhost:8444/csa/rest/user/multipleSubscription/delete?userIdentifier=" + userId;
  body       = "<ServiceSubscriptionList><ServiceSubscription>"
              +"<id>" + subId + "</id>"
              + "<catalogItem>"
              +"<id>" + catId +"</id>"
              +"<catalog>"
              +"<id>"+ catId +"</id>"
              +"</catalog>"
              +"</catalogItem>"
              +"</ServiceSubscription>"
              +"</ServiceSubscriptionList>";
} 
else if (action.equals("cancel")){
  url        = "https://localhost:8444/csa/rest/catalog/" + catId + "/request?userIdentifier=" + userId;
  body       = "<ServiceRequest><description>Manual Fail</description>"
              + "<name>My Fail</name>"
              + "<displayName>My Fail</displayName>"
              + "<artifactContext><id>" + subId + "</id></artifactContext>"
              + "<visibility><name>PUBLIC</name></visibility>"
              + "<requestedAction><name>CANCEL_SUBSCRIPTION</name></requestedAction>"
              + "</ServiceRequest>";
}

/* Initialize the Logger */
log = Logger.getLogger("action.jsp");
log.setLevel(Level.INFO);
log.info(action + "  Subscription (Experimental) Called");

/* Setup the HTTP Client */
client = new HttpClient();
client.getParams().setAuthenticationPreemptive(true);
client.getState().setCredentials(
  new AuthScope(AuthScope.ANY_HOST, AuthScope.ANY_PORT),
  new UsernamePasswordCredentials("admin","cloud")
);

/* This just initializes the HTTP Post object. */
PostMethod post = new PostMethod(url);

try {
  post.setDoAuthentication( true );
  post.setRequestHeader("Content-type", "application/xml; charset=UTF-8");
  post.setRequestHeader("Accept", "application/xml; charset=UTF-8");
  post.setRequestBody(body);
  status = client.executeMethod(post);
  if(status == 200){
    out.println("<p><span class='label label-success'>Success</span></p><p><span class='label label-default'>Return Code: "+status+"</span></p>");
  } else{
    out.println("<p><span class='label label-danger'>Error</span><br /></p><p><span class='label label-default'>Return Code: "+status+"</span></p>");
}
  myResponse = post.getResponseBodyAsString();
  esc = new StringEscapeUtils();
  out.println("<well><pre><code>" + esc.escapeXml(myResponse) + "</code></pre></well>");
}

catch(Exception e){
  log.error(action + " Subscription Failed " + e.getMessage());
  e.printStackTrace(response.getWriter());
}     
finally {
  // release any connection resources used by the method
  post.releaseConnection();
}
%>
