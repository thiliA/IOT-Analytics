var gadgetConfig ={"id":"CountPerSensorId_DonutChart","title":"CountPerSensorId_DonutChart","datasource":"ORG_WSO2_EVENT_GROUPED_SENSOR_STREAM","type":"batch","columns":[{"name":"sensor_id","type":"string"},{"name":"count","type":"long"},{"name":"sum","type":"double"},{"name":"average","type":"double"},{"name":"max","type":"double"},{"name":"min","type":"double"}],"chartConfig":{"x":"sensor_id","maxLength":"100","padding":{"top":30,"left":45,"bottom":10,"right":100},"charts":[{type: "arc",  x : "count", color : "sensor_id", mode: "donut"}]},"domain":"carbon.super"};