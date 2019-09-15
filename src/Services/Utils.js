



const stringToFileDownload = (filename, content) =>{
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}



var timeToDate = (timestamp) =>{
    var d = new Date(timestamp * 1000);
    return d;
}


var broadcastEvent = (event) =>{

    var version = window.localStorage.getItem(event);

    if (version == null) window.localStorage.setItem(event,0);
    else window.localStorage.setItem(event,version + 1);
}


export default {
    stringToFileDownload,
    timeToDate,
    broadcastEvent
}