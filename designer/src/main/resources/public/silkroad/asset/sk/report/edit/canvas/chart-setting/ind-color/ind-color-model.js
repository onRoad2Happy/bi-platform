define(["url","core/helper"],function(a){var b=Backbone.Model.extend({defaults:{},initialize:function(){},getCompAxis:function(b){var c=this;$.ajax({url:a.getCompAxis(this.get("reportId"),this.get("compId")),success:function(a){c.getIndColorList(a.data,b)}})},getIndColorList:function(b,c){var d=this;$.ajax({url:a.getIndColorList(d.get("reportId"),d.get("compId")),type:"get",success:function(a){var d=a.data,e={indList:{}},f=b.yAxis;if(f)for(var g=0,h=f.length;h>g;g++){var i=f[g].name;e.indList[i]={},e.indList[i].caption=f[g].caption,e.indList[i].color=d.hasOwnProperty(i)?d[i]:null}c(e)}})},saveIndColorInfo:function(b,c){var d=this.get("compId"),e={areaId:d,colorFormat:JSON.stringify(b)};$.ajax({url:a.getIndColorList(this.get("reportId"),d),type:"POST",data:e,success:function(){c()}})}});return b});