SELECT
sub_view.subscription_id,
sub_view.subscription_name,
inst.uuid as instance_id,
art.display_name as instance_name,
sub_view.subscription_start_date,
sub_view.subscription_end_date,
sub_view.subcription_owner_group,
sub_view.subscription_status,
sub_view.requested_by_user,
sub_view.requested_by_user_email,
sub_view.catalog_id,
subpers.user_name,
sub_view.organization_name,
sub_view.service_offering_name,
cat.display_name as artifact_state,
cat2.display_name as instance_state,
cat3.display_name as lifecycle_status,
art2.icon_url,
service_offering_name,
sub_view.organization_name,
sub_view.organization_id
FROM rpt_user_subscription_v sub_view
INNER JOIN csa_service_instance inst ON inst.subscription_id = sub_view.subscription_id
INNER JOIN csa_artifact art ON inst.UUID = art.UUID
INNER JOIN csa_artifact art2 ON sub_view.subscription_id = art2.UUID
LEFT JOIN csa_lifecycle_ex_record le on inst.UUID = le.service_instance_id
AND le.reverse='0' AND le.callback_pending='1' AND le.callback_bean IN ('orderOfferingInitializationCallBack','orderOfferingReservationCallBack','orderOfferingDeploymentCallBack')
INNER JOIN csa_category cat ON art.state_id = cat.uuid
INNER JOIN csa_category cat2 ON inst.service_instance_state_id = cat2.uuid
LEFT JOIN csa_category cat3 on le.execution_status_id = cat3.uuid
LEFT JOIN csa_category cat4 on le.execution_state_id = cat4.uuid
INNER JOIN csa_person subpers ON sub_view.requested_by_user_id = subpers.uuid
WHERE cat.display_name != ?
ORDER BY subscription_start_date, le.updated_on DESC
   