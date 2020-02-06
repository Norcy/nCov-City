var BASE_URL = "https://lab.isaaclin.cn/nCoV/api/area?latest=0&province=";

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

// 是否是直辖市
function isMunicipalityCity(province) {
    if (province[province.length-1] == "市") {
        return true;
    }

    if (province.includes("澳门") || province.includes("香港") ||
        province.includes("台湾")) {
        return true;
    }
    
    return false;
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
    let isMunicipality = isMunicipalityCity(province);
    if (isMunicipality) {
        cityDatas.name = province;
    } else {
        cityDatas.name = province+' '+city;
    }

    $('#nowValue').val(cityDatas.name+" >");
    $('#nowValue').prop('disabled', true);

    $.get(BASE_URL+province, function(results){
        console.log("Request Success");
        let dataList = results.results;
        for (let result of dataList) {
            let cityObj = {};
            cityObj["updateTime"] = result.updateTime;

            if (isMunicipality) {
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
            name: '确诊人数'
        },
        series: [{
            data: [],
            type: 'line',
            smooth: true,
            // smoothMonotone: "y"
        }],
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            show: false
        }
    };

    if (cityDatas) {
        var dateSets = {};   // 日期的集合，相同日期的相加
        for (let i = cityDatas.list.length-1; i >= 0; i--) {
            let cityData = cityDatas.list[i];
            let date = new Date(cityData.updateTime);
            let dateStr = (date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
            if (dateSets[dateStr] == undefined) {
                dateSets[dateStr] = 0;
            } 
            if (cityData.confirmedCount) {
                dateSets[dateStr] = Math.max(cityData.confirmedCount, dateSets[dateStr]);
            }
        }

        for (let date in dateSets) {
            option.series[0].data.push([date,dateSets[date]]);
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