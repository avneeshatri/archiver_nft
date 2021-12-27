import Alert from 'react-s-alert';

var baseUrl = "http://127.0.0.1:5000" ;
var x_access_token_cookie = "x-access-token";
var x_user_id_cookie = "x-user-id";

export function fetchPromise(url, options) {
    return fetch(baseUrl + url, options)
    .then(response => {
        if(response.status === 401) {
           console.log("Authentication failure")
        } else if(response.status === 403) {
            console.log("Access Denied")
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return response;
        }  

    }).then(response => {
        if(response.status === 'FORBIDDEN') {
            displayCustomPopup({msg: response.msg || 'Unauthorised for current operation'}, 'error');
            //return null to the caller function so that no further processing should happen in caller function
            return null;
        } else if(response.status === 'FAILED' || response.status === 'Not Modified') {
            displayCustomPopup(response, 'error');
            return null;
        } else if(response.status === 'SUCCESS') {
            displayCustomPopup(response, 'success');
        } else if(response.status === 'WARN') {
            displayCustomPopup(response, 'warning');
        }
        
        if(response.data) {
            return response.data;
        }
        return response;
    });
}



export function displayCustomPopup(response, type) {
    switch(type) {
        case 'error': 
            console.log("Dispaly error popup")
            Alert.error(response.msg, {
                position: 'bottom-right',
                html: true,
                effect: 'slide',
                timeout: 30000,
                customFields: {
                    detailedError: response.detailedMsg,
                    heading: 'Error',
                    type: 'error'
                }
            });
            break;
        case 'success':
            Alert.success(response.msg, {
                position: 'bottom-right',
                html: true,
                effect: 'slide',
                timeout: 30000,
                customFields: {
                    detailedError: response.detailedMsg,
                    heading: 'Success',
                    type: 'success'
                }
            });
            break;
        case 'info':
            console.log("Dispaly info popup:" + response.msg)
            Alert.info(response.msg, {
                position: 'bottom-right',
                html: true,
                effect: 'slide',
                timeout: 30000,
                customFields: {
                    detailedError: response.detailedMsg,
                    heading: 'Info',
                    type: 'info'
                }
            });
            break;
        case 'warning':
            Alert.warning(response.msg, {
                position: 'bottom-right',
                html: true,
                effect: 'slide',
                timeout: 30000,
                customFields: {
                    detailedError: response.detailedMsg,
                    heading: 'Warning',
                    type: 'warning'
                }
            });
            break;
    }
}

export function isUndefined(item) {
    if(typeof item == "undefined" || item == null){
        return true
    }
    return false 
}

export function isAuthenticated(){
    if(hasCookie(x_access_token_cookie) && hasCookie(x_user_id_cookie)){
        return true;
    }
    return false ;
}

function hasCookie(cname){
    if(getCookie(cname) == null){
        return false ;
    }
    return true ;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
}


export function getURIParam(key){
    let search = window.location.search;
    let params = new URLSearchParams(search);
    return params.get(key);
}

export function formatDate(dateStr){
    if(!isUndefined(dateStr)){
        dateStr = dateStr.replace("[UTC]", "");
        const date = new Date(dateStr);
        return date.getHours()+" hr "+date.getMinutes()+ " min, "+date.getDate()+" "+date.toLocaleString('default', { month: 'long' }) + " " +date.getFullYear();
    }
}