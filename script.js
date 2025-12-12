// === CONFIG ===
let api = "https://script.google.com/macros/s/AKfycbzN5IMDqia3TazlKCBrg3u55AUugwOyrxYh3h9jg9brMG17zBwnuYV3Il13c82k6VXg2w/exec";

// === MAP INIT ===
let map = L.map("map").setView([20.59,78.96],5);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
let marker;

// === DRIVER LOGIC ===
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

if(nameInput){
    const saved = localStorage.getItem('rt_driver_name');
    if(saved){ 
        nameInput.value = saved; 
        startBtn.style.display='inline-block'; 
        stopBtn.style.display='inline-block'; 
    }

    nameInput.addEventListener('input', ()=>{
        if(nameInput.value.trim().length>0){ 
            startBtn.style.display='inline-block'; 
            stopBtn.style.display='inline-block'; 
        } else{ 
            startBtn.style.display='none'; 
            stopBtn.style.display='none'; 
        }
    });

    startBtn.addEventListener('click', ()=>sendStatus("START"));
    stopBtn.addEventListener('click', ()=>sendStatus("STOP"));

    function sendStatus(type){
        navigator.geolocation.getCurrentPosition(pos=>{
            let lat=pos.coords.latitude;
            let lon=pos.coords.longitude;

            if(marker){ 
                marker.setLatLng([lat,lon]); 
            } else{ 
                marker=L.marker([lat,lon]).addTo(map); 
            }

            map.setView([lat,lon],14);

            let url=api+"?action=push&name="+encodeURIComponent(nameInput.value)+"&type="+type+"&lat="+lat+"&lon="+lon;
            fetch(url)
            .then(r=>console.log(type+" pushed"))
            .catch(e=>console.error("Error pushing location:",e));
        });

        if(type=="START"){ 
            startBtn.disabled=true; 
            stopBtn.disabled=false; 
        } else{ 
            startBtn.disabled=false; 
            stopBtn.disabled=true; 
        }
    }
}

// === OWNER LOGIC ===
const liveTable = document.getElementById('liveTable');
if(liveTable){
    function refreshOwner(){
        fetch(api+"?action=read")
            .then(r=>r.json())
            .then(data=>{
                liveTable.innerHTML="";
                data.forEach(row=>{
                    let tr=document.createElement("tr");
                    tr.innerHTML=`<td>${row.name}</td><td>${row.type}</td><td>${row.lat}</td><td>${row.lon}</td><td>${row.time}</td>`;
                    liveTable.appendChild(tr);
                    L.marker([parseFloat(row.lat),parseFloat(row.lon)]).addTo(map);
                });
            })
            .catch(e=>console.error("Error reading data:",e));
    }
    refreshOwner();
    setInterval(refreshOwner,5000);
}
