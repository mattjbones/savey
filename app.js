const subjectPrefix = "52 Week Savings";
const defaultStart = "12:00 PM";
const defaultEnd = "12:15 PM";
const defaultDay = 1;

const getSelectedDay = function () {
    return parseInt(document.getElementById('day-sel').value, 10);
}

const getCsvDateString = function (date){
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

const getIcalDateString = function (date){
    const month = date.getMonth() + 1
    const monthString = month < 10 ? "0" + month : "" + month;

    const day = date.getDate();
    const dayString = day < 10 ? "0" + day : "" + day;

    return `${date.getFullYear()}${monthString}${dayString}`;
}

const generateData = function (){
    const todaysDate = new Date();
    const startDay = getSelectedDay() || defaultDay;
    const today = todaysDate.getDay();
    const isTodayStartDay = startDay === today;

    const differenceMillis = (today > startDay ? today + startDay : startDay - today)*60*60*1000*24;
    const startDate = isTodayStartDay ? todaysDate : new Date(Date.now() + differenceMillis);
    
    const data = [];
    let total = 1; 
    while (data.length < 53){
        const week = data.length;
        const amount = week + 1;
        const difference = (week) * 60 * 60 * 24 * 7 * 1000;
        const weekDate = new Date(startDate.getTime() + difference); 

        total += week;

        const line = {
            subject:`${subjectPrefix}: Transfer \u00A3${amount}`,   
            startDate: weekDate,
            startTime: defaultStart,
            endDate: weekDate,
            endTime: defaultEnd,
            allDay: false, 
            description: `Week ${week}: total saved ${total}`,
            uid: `${weekDate.getTime()}-${week}-${total}-${amount}`
        };

        data.push(line);
    }
    return data;
};

const downloadFile = function (filename, data) {
    // delay long enough to show the animation on mobile
    window.setTimeout(function (){

        var blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        }
        else{
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;        
            document.body.appendChild(elem);
            elem.click();         
            document.body.removeChild(elem);
        }
    }, 250);
};

const generateCsv = function (data, downloadFile) {
    const csvHeader = ["Subject", "Start Date", "Start Time", "End Date", "End Time", "All Day", "Description", "UID" ];
    const csvSaveData = generateData()
        .map(({subject, startDate, startTime, endDate, endTime, allDay, description, uid}) =>
            ([subject, startDate, startTime, endDate, endTime, allDay, description, uid]) 
            );
    const final = [ csvHeader, ...csvSaveData ];
    downloadFile('52 week challenge.csv', final.map(e => e.join(",")).join("\n"));
};

const generateIcal = function(data, downloadFile) {
    const header = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Savey//Savey Calendar 1.0//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ];

    const footer = "END:VCALENDAR";

    const createEntry = function (data){
        return [
            "BEGIN:VEVENT",
            `SUMMARY:${data.subject}`,
            `UID:${data.uid}`,
            "SEQUENCE:0",
            "STATUS:CONFIRMED",
            "TRANSP:TRANSPARENT",
            `DTSTART:${getIcalDateString(data.startDate)}`,
            `DTEND:${getIcalDateString(data.endDate)}`,
            `DTSTAMP:${getIcalDateString(data.startDate)}T140000`,
            `DESCRIPTION:${data.description}`,
            "END:VEVENT"
        ];
    };

    const final = [
        header.join('\r\n'),
        ...data.map(entry => createEntry(entry).join('\r\n')),
        footer
    ].join('\r\n');
    downloadFile(`${subjectPrefix}.ics`, final);
};

const generateGcal = function () {
    event.preventDefault();
    const data = generateData();
    alert("Coming soon!");
};

const addFileData = function (element) {
    return function (filename, data){
        var blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        element.href = window.URL.createObjectURL(blob);
        element.download = filename;        
    }
}



const csvButton = document.getElementById('gen-csv');            
const gcalButton = document.getElementById('gen-gcal');
const icalButton = document.getElementById('gen-ical');
const data = generateData();

const icalDownloadFile = addFileData(icalButton);
generateIcal(data, icalDownloadFile);
