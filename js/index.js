var CITY_URL = "https://lab.isaaclin.cn/nCoV/api/area?latest=0&province=";
var COUNTRY_URL = "https://lab.isaaclin.cn/nCoV/api/overall?latest=0";

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

    let isCountry = (province.includes("全国"));
    let url = CITY_URL+province;
    if (isCountry) {
        url = COUNTRY_URL;
    }
    
    $.get(url, function(results){
        console.log("Request Success");
        let dataList = results.results;
        for (let result of dataList) {
            let cityObj = {};
            cityObj["updateTime"] = result.updateTime;

            if (isAll) {
                cityObj["confirmedCount"] = result.confirmedCount;
                cityObj["suspectedCount"] = result.suspectedCount;
                cityObj["curedCount"] = result.curedCount;
                cityObj["deadCount"] = result.deadCount;
            } else {
                for (let key in result.cities) {
                    let cityData = result.cities[key];
                    if (cityData.cityName == city || cityData.cityName+"市" == city) {
                        cityObj["confirmedCount"] = cityData.confirmedCount;
                        cityObj["suspectedCount"] = cityData.suspectedCount;
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
    });
}

function getData(cityDatas)
{
    var option = {
        legend: {
            data: ['确诊人数', '治愈人数', '死亡人数'],
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
            name: '确诊人数',
            data: [],
            type: 'line',
            smooth: true,
            // smoothMonotone: "y"
        }, {
            name: '治愈人数',
            data: [],
            type: 'line',
            smooth: true,
        }, {
            name: '死亡人数',
            data: [],
            type: 'line',
            smooth: true,
        }],
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            show: false
        }
    };

    if (cityDatas) {
        var confirmedSet = {};   // 集合，相同日期的相加
        var curedSet = {};
        var deadSet = {};
        for (let i = cityDatas.list.length-1; i >= 0; i--) {
            let cityData = cityDatas.list[i];
            let date = new Date(cityData.updateTime);
            let dateStr = (date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
            if (confirmedSet[dateStr] == undefined) {
                confirmedSet[dateStr] = 0;
            } 
            if (cityData.confirmedCount) {
                confirmedSet[dateStr] = Math.max(cityData.confirmedCount, confirmedSet[dateStr]);
            }

            if (curedSet[dateStr] == undefined) {
                curedSet[dateStr] = 0;
            } 
            if (cityData.curedCount) {
                curedSet[dateStr] = Math.max(cityData.curedCount, curedSet[dateStr]);
            }

            if (deadSet[dateStr] == undefined) {
                deadSet[dateStr] = 0;
            } 
            if (cityData.deadCount) {
                deadSet[dateStr] = Math.max(cityData.deadCount, deadSet[dateStr]);
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