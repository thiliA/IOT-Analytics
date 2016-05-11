var gadgetConfig ={"id":"DistinctCount","title":"Sensor ID Count","datasource":"ORG_WSO2_EVENT_CURRENT_STATISTICS_STREAM","type":"batch","columns":[{"name":"sensor_type","type":"string"},{"name":"sensor_id_distinct_count","type":"long"},{"name":"count","type":"long"},{"name":"sum","type":"double"},{"name":"average","type":"double"},{"name":"max","type":"double"},{"name":"min","type":"double"}],"chartConfig":{"x":"sensor_id_distinct_count","maxLength":"","padding":{"top":30,"left":45,"bottom":38,"right":55},"charts":[{"type":"number","title":"Displays Sensor ID Distinct Count"}]},"domain":"carbon.super"};