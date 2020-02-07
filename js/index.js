var CITY_URL = "https://lab.isaaclin.cn/nCoV/api/area?latest=0&province=";
var COUNTRY_URL = "https://lab.isaaclin.cn/nCoV/api/overall?latest=0";
var Data_Cache = {};
var Chart_Mode = 0; // 0 为累计人数；1 为新增人数
var LegendName = [['确诊人数', '治愈人数', '死亡人数', '疑似人数', '重症人数'], 
                  ['新增确诊', '新增治愈', '新增死亡', '新增疑似', '新增重症']];

function onLoad()
{
    reloadChart();   
}

function reloadChart(cityDatas)
{
    var dom = document.getElementById("container");
    var myChart = echarts.init(dom);
    var app = {};
    var option = getData(cityDatas)

    if (option &&typeof option === "object")
    {
        myChart.setOption(option, true);
    }
}

function picker() {
    var nowValue = $('#nowValue');
    new Picker({
        "title": '城市选择',//标题(可选)
        "defaultValue": nowValue.val(),//默认值-多个以空格分开（可选）
        "type": 2,//需要联动级数[1、2、3]（可选）
        "data": cityData,//数据(必传)
        "keys": {
            "id": "code",
            "value": "name",
            "childData": "cities"//最多3级联动
        },//数组内的键名称(必传，id、text、data)
        "callBack": function (resultArray) {
            requestData(resultArray[0], resultArray[1]);
        }
    });
};

// 是否需要查询整个省的数据（全部地区 或 直辖市）
function isAllProvince(province, city) {
    return province == city;
}

function handleProvinceName(province) {
    if (province.includes("澳门")) {
        return "澳门"
    }
    if (province.includes("香港")) {
        return "香港"
    }
    if (province.includes("台湾")) {
        return "台湾"
    }
    return province;
}

// 示例参数："广东省"，"深圳市"
function requestData(province, city) {
    province = handleProvinceName(province);
    let cityDatas = {"name" : "", "list": []};
    let isAll = isAllProvince(province, city);
    if (isAll) {
        cityDatas.name = province;
    } else {
        cityDatas.name = province+' '+city;
    }

    $('#nowValue').val(cityDatas.name+" >");
    $('#nowValue').prop('disabled', true);

    let isCountry = province.includes("全国");
    let url = CITY_URL+province;
    if (isCountry) {
        url = COUNTRY_URL;
    }

    cityDatas["isCountry"] = isCountry;

    if (Data_Cache[province]) {
        console.log("Cache Load");
        handleRequestData(Data_Cache[province], cityDatas, isAll, city);
    } else {
        $.get(url, function(results){
            console.log("Request Success");
            Data_Cache[province] = results.results;
            handleRequestData(results.results, cityDatas, isAll, city);
        });
    }
}

function handleRequestData(dataList, cityDatas, isAll, city) {
    for (let result of dataList) {
        let cityObj = {};
        cityObj["updateTime"] = result.updateTime;

        if (isAll) {
            cityObj["confirmedCount"] = result.confirmedCount;
            cityObj["suspectedCount"] = result.suspectedCount;
            cityObj["seriousCount"] = result.seriousCount;
            cityObj["curedCount"] = result.curedCount;
            cityObj["deadCount"] = result.deadCount;
        } else {
            for (let key in result.cities) {
                let cityData = result.cities[key];
                if (cityData.cityName == city || cityData.cityName+"市" == city) {
                    cityObj["confirmedCount"] = cityData.confirmedCount;
                    cityObj["suspectedCount"] = cityData.suspectedCount;
                    cityObj["seriousCount"] = cityData.seriousCount;
                    cityObj["curedCount"] = cityData.curedCount;
                    cityObj["deadCount"] = cityData.deadCount;
                    break;
                }
            }
        }
        cityDatas["list"].push(cityObj);
    }
    console.log(cityDatas);
    reloadChart(cityDatas);
    $('#nowValue').prop('disabled', false);
}

function getData(cityDatas)
{
    var chartType = Chart_Mode == 0 ? 'line' : 'bar';
    var option = {
        legend: {
            data: [LegendName[Chart_Mode][0], LegendName[Chart_Mode][1], LegendName[Chart_Mode][2]],
            y: 'bottom'
        },
        xAxis: {
            type: 'time',
            splitLine : {
                show: false
            },
            axisLabel :{
                formatter: function (value, index) {
                    // 格式化成月/日，只在第一个刻度显示年份
                    var date = new Date(value);
                    var texts = [(date.getMonth() + 1), date.getDate()];
                    if (index === 0) {
                        texts.unshift(date.getFullYear());
                    }
                    return texts.join('/');
                },
                fontSize: 8
            },
            maxInterval: 3600 * 24 * 1000 * 2
        },
        yAxis: {
            type: 'value',
            name: '人数'
        },
        series: [{
            name: LegendName[Chart_Mode][0],
            data: [],
            type: chartType,
            smooth: true,
            // smoothMonotone: "y"
        }, {
            name: LegendName[Chart_Mode][1],
            data: [],
            type: chartType,
            smooth: true,
        }, {
            name: LegendName[Chart_Mode][2],
            data: [],
            type: chartType,
            smooth: true,
        }],
        tooltip: {
            trigger: 'axis'
        }
    };

    if (cityDatas) {

        if (cityDatas["isCountry"]) {
            option.series.push({
                name: LegendName[Chart_Mode][3],
                data: [],
                type: chartType,
                smooth: true,
            });

            option.series.push({
                name: LegendName[Chart_Mode][4],
                data: [],
                type: chartType,
                smooth: true,
            });

            option.legend.data.push(LegendName[Chart_Mode][3]);
            option.legend.data.push(LegendName[Chart_Mode][4]);
        }

        var confirmedSet = {};   // 集合，相同日期的相加
        var curedSet = {};
        var deadSet = {};
        var suspectedSet = {};
        var seriousSet = {};
        for (let i = 0; i < cityDatas.list.length; i++) {
            let cityData = cityDatas.list[i];
            let date = new Date(cityData.updateTime);
            let dateStr = (date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());

            // 取当天最新的消息
            if (confirmedSet[dateStr] == undefined) {
                confirmedSet[dateStr] = cityData.confirmedCount?cityData.confirmedCount:0;
            }

            if (curedSet[dateStr] == undefined) {
                curedSet[dateStr] = cityData.curedCount?cityData.curedCount:0;
            }

            if (deadSet[dateStr] == undefined) {
                deadSet[dateStr] = cityData.deadCount?cityData.deadCount:0;
            }

            if (suspectedSet[dateStr] == undefined) {
                suspectedSet[dateStr] = cityData.suspectedCount?cityData.suspectedCount:0;
            }

            if (seriousSet[dateStr] == undefined) {
                seriousSet[dateStr] = cityData.seriousCount?cityData.seriousCount:0;
            }
        }

        for (let date in confirmedSet) {
            option.series[0].data.push([date,confirmedSet[date]]);
        }

        for (let date in curedSet) {
            option.series[1].data.push([date,curedSet[date]]);
        }

        for (let date in deadSet) {
            option.series[2].data.push([date,deadSet[date]]);
        }

        if (cityDatas["isCountry"]) {
            for (let date in suspectedSet) {
                option.series[3].data.push([date,suspectedSet[date]]);
            }    
            for (let date in seriousSet) {
                option.series[4].data.push([date,seriousSet[date]]);
            }    
        }


        if (Chart_Mode == 1) {
            for (let k = 0; k < option.series.length; k++) {
                for (let i = 0; i < option.series[k].data.length-1; i++) {
                    option.series[k].data[i][1] -= option.series[k].data[i+1][1];
                }
            }
        }
    }
    console.log(option);
    return option;
}

function showToast() {
    console.log("showToast");
    var Toast = {};
    Toast.toast = function(msg) {
        var active = "toast-active";
        var div = document.createElement("div");
        div.classList.add("toast-container")
        div.innerHTML = '<div class="toast-message-container">' + msg + "</div>"
        div.addEventListener("webkitTransitionEnd", function() {
            div.classList.contains(active) || div.parentNode.removeChild(div)
        });
        document.body.appendChild(div)
        div.offsetHeight
        div.classList.add(active)
        setTimeout(function() {
            div.classList.remove(active)
        }, 2500)
    }
    Toast.toast("已复制作者微信号");
}

onLoad();
// requestData("广东省", "深圳市");
// requestData("山西省", "太原市");