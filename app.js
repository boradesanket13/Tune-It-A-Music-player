// let seed_artists = '';
// let seed_genres = '';
// let seed_tracks = '';
var queue = "";
var access_token = null;
var refresh_token = null;
var redirect_uri = "http://127.0.0.1:5500/index.html"; // change this your value
var client_id = ""; 
var client_secret = ""; // In a real app you should not expose your client_secret to the user
const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";


//api links
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PLAYER = "https://api.spotify.com/v1/me/player";
const USER = `https://api.spotify.com/v1/me`;
// const LIKEDTRACKS = 'https://api.spotify.com/v1/me/tracks'
const TOPTRACKS = "https://api.spotify.com/v1/me/top/tracks?limit=10";
const TOPARTISTS = 'https://api.spotify.com/v1/me/top/artists?limit=10';
const RECENTLY_PLAYED = 'https://api.spotify.com/v1/me/player/recently-played?limit=10';
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const FOLLOWED_ARTISTS = 'https://api.spotify.com/v1/me/following?type=artist';
const SAVED_ALBUMS = 'https://api.spotify.com/v1/me/albums?limit=10';

onPageLoad();

function onPageLoad(){
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    else{
        access_token = localStorage.getItem("access_token");
    }
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri); // remove param from url
}

function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            // console.log(access_token);
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if( queryString.length > 0){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

// function mergelink(text){
//     const RECOMMENDATIONS
// }

//top tracks api call
callApi( "GET", TOPTRACKS, null, handleTopTracksResponse );

function handleTopTracksResponse(){
    if( this.status == 200 ){
        var data_toptracks = JSON.parse(this.responseText);
        console.log(data_toptracks);

        // seed_tracks = 'seed_tracks=';
        // for( let i=1;i<=5;i++){
        //     if(i==5){
        //         seed_tracks+=`${data_toptracks.items[i].id}&`
        //     }
        //     else{
        //         seed_tracks+=`${data_toptracks.items[i].id}%2C`
        //     }
        // }
        // mergelink(seed_tracks);
        const RECOMMENDATIONS = `https://api.spotify.com/v1/recommendations?limit=10&market=IN&seed_artists=${data_toptracks.items[0].artists[0].id}&seed_tracks=${data_toptracks.items[0].id}`;
        callApi( "GET", RECOMMENDATIONS, null, handleRecommendationsResponse );

        const TOPARTIST_TOPTRACK = `https://api.spotify.com/v1/artists/${data_toptracks.items[0].artists[0].id}/top-tracks?market=IN`;
        callApi( "GET", TOPARTIST_TOPTRACK, null, handleTopArtistResponse );

        const container = document.getElementById('liked-songs');
        let adder = '';
        data_toptracks.items.forEach( song_ => {
            adder+=`<li class="songItem">
                        <div class="img_play">
                            <img src="${song_.album.images[0].url}" alt="${song_.artists[0].name}">
                            <i class="bi playListPlay bi-play-circle-fill" id="${song_.id}" onclick="songClick('${song_.id}')"></i>
                        </div>
                        <h5>${song_.name}
                            <br>
                            <div class="subtitle">${song_.artists[0].name}</div>
                        </h5>
                    </li>`
        })
        container.innerHTML = adder;
        // console.log(data_user.images[0].url);
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

//top-artist api call
function handleTopArtistResponse(){
    if( this.status == 200 ){
        var data_topartist = JSON.parse(this.responseText);
        console.log(data_topartist);
        const bgimg = document.getElementById('cover-img');
        bgimg.src = `${data_topartist.tracks[0].album.images[0].url}`;
        const top_artist_song = document.getElementById('top-artist-song');
        top_artist_song.textContent = data_topartist.tracks[0].album.artists[0].name + ' - ' + data_topartist.tracks[0].name ;
        const date = document.getElementById('release_date');
        date.textContent = data_topartist.tracks[0].album.release_date;
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

//saved-albums api call
callApi( "GET", SAVED_ALBUMS, null, handleSavedAlbumsResponse );

function handleSavedAlbumsResponse(){
    if( this.status == 200 ){
        var data_savedAlbums = JSON.parse(this.responseText);
        console.log(data_savedAlbums);

        const container = document.getElementById('saved-albums');
        let adder = '';
        data_savedAlbums.items.forEach(album_ => {
            adder+=`<li class="songItem">
                        <div class="img_play">
                            <img src="${album_.album.images[0].url}" alt="${album_.album.artists[0].name}">
                            <i class="bi playListPlay bi-play-circle-fill" id="${album_.id}" onclick="songClick('${album_.id}')"></i>
                        </div>
                        <h5>${album_.album.name}
                            <br>
                            <div class="subtitle">${album_.album.artists[0].name}</div>
                        </h5>
                    </li>`
        })
        container.innerHTML = adder;
        
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

//user api call
callApi( "GET", USER, null, handleUsersResponse );

function handleUsersResponse(){
    if( this.status == 200 ){
        var data_user = JSON.parse(this.responseText);
        console.log(data_user);
        const userimg = document.getElementById('userimg');
        const username = document.getElementById('username');
        const profileimg = document.getElementById('profile_img');
        const profilename = document.getElementById('profile_name');
        profileimg.src = data_user.images[0].url;
        profilename.textContent = data_user.display_name;
        userimg.src = data_user.images[0].url;
        username.textContent = data_user.display_name;

        const PLAYLISTS = `https://api.spotify.com/v1/users/${data_user.id}/playlists?limit=10`;
        callApi( "GET", PLAYLISTS, null, handlePlaylistsResponse );
        // console.log(data_user.images[0].url);
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

//devices api call
callApi( "GET", DEVICES, null, handleDevicesResponse );

function handleDevicesResponse(){
    if ( this.status == 200 ){
        var data_devices = JSON.parse(this.responseText);
        console.log(data_devices);
        const devices = document.getElementById('devices');
        data_devices.devices.forEach( device_ => {
            let node = document.createElement('option');
            node.value = device_.id;
            node.innerHTML = device_.name;
            devices.appendChild(node);
        })
        // removeAllItems( "devices" );
        // data.devices.forEach(item => addDevice(item));
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


//playlists api call
function handlePlaylistsResponse(){
    if( this.status == 200 ){
        var data_playlists = JSON.parse(this.responseText);
        console.log(data_playlists);
        const container = document.getElementById('menu-song');
        let c=0;
        let adder = '';
        data_playlists.items.forEach( playlist_ => {
            c+=1;
            adder+=`<li class="songItem">
                        <span>${c}</span>
                        <img src="${playlist_.images[0].url}" alt="${playlist_.name}">
                        <h5>
                            ${playlist_.name}
                            <div class="subtitle">${playlist_.owner.display_name}</div>
                        </h5>
                        <i class="bi playListPlay bi-play-circle-fill" id="${playlist_.id}" onclick="playlistClick('${playlist_.id}')"></i>
                    </li>`
        })
        container.innerHTML = adder;
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

//followed artists api call
callApi( "GET", FOLLOWED_ARTISTS, null, handleFollowedArtistsResponse );

function handleFollowedArtistsResponse(){
    if( this.status == 200 ){
        var data_followartists = JSON.parse(this.responseText);
        console.log(data_followartists);

        const container = document.getElementById('follow-artists');
        let adder = '';
        data_followartists.artists.items.forEach( artist_ => {
            adder+=`<li>
                        <img src="${artist_.images[0].url}" alt="${artist_.name}" title="${artist_.name}" id="${artist_.id}" onclick="artistClick('${artist_.id}')">
                        <div class="subtitle">${artist_.name}</div>
                    </li>`
            })
        container.innerHTML = adder;
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// recently played api call
callApi( "GET", RECENTLY_PLAYED, null, handleRecentlyPlayedResponse );

function handleRecentlyPlayedResponse(){
    if( this.status == 200 ){
        var data_recentlyPlayed = JSON.parse(this.responseText);
        console.log(data_recentlyPlayed);
        const container = document.getElementById('recently-played');
        let c=0;
        let adder = '';
        data_recentlyPlayed.items.forEach( song_ => {
            c+=1;
            adder+=`<li class="songItem">
                        <span>${c}</span>
                        <img src="${song_.track.album.images[0].url}" alt="${song_.track.name}">
                        <h5>
                            ${song_.track.name}
                            <div class="subtitle">${song_.track.artists[0].name}</div>
                        </h5>
                        <i class="bi playListPlay bi-play-circle-fill" id="${song_.track.id}" onclick="songClick('${song_.track.id}')"></i>
                    </li>`
        })
        container.innerHTML = adder;
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// top artists api call
callApi( "GET", TOPARTISTS, null, handleTopArtistsResponse );

function handleTopArtistsResponse(){
    if( this.status == 200 ){
        var data_topartists = JSON.parse(this.responseText);
        console.log(data_topartists);

        // seed_artists = 'seed_artists=';
        // seed_genres = 'seed_genres=';
        // for( let i=1;i<=5;i++){
        //     if(i==5){
        //         seed_artists+=`${data_topartists.items[i].id}&`
        //         seed_genres+=`${data_topartists.items[i].genres[0]}`
        //     }
        //     else{
        //         seed_artists+=`${data_topartists.items[i].id}%2C`
        //         seed_genres+=`${data_topartists.items[i].genres[0]}%2C`
        //     }
        // }
        // mergelink(seed_artists);
        // mergelink(seed_genres)
        // const top_song = getTopSong(TOPARTISTSONG);
        // top_artist_song.textContent = data_topartists.items[0].name + '-' + top_song ;
        const container = document.getElementById('fav-artists');
        let adder = '';
        data_topartists.items.forEach( artist_ => {
            adder+=`<li>
                        <img src="${artist_.images[0].url}" alt="${artist_.name}" title="${artist_.name}" id="${artist_.id}" onclick="artistClick('${artist_.id}')">
                        <div class="subtitle">${artist_.name}</div>
                    </li>`
            })
        container.innerHTML = adder;
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handlePlaylistTracksResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function deviceid(){
    return document.getElementById("devices").value;
}
// recommendations api call

function handleRecommendationsResponse(){
    if( this.status == 200 ){
        var data_recommendations = JSON.parse(this.responseText);
        console.log(data_recommendations);
        const container = document.getElementById('recommendations');
        let c=0;
        let adder = '';
        data_recommendations.tracks.forEach( song_ => {
            c+=1;
            adder+=`<li class="songItem">
                        <span>${c}</span>
                        <img src="${song_.album.images[0].url}" alt="${song_.name}">
                        <h5>
                            ${song_.name}
                            <div class="subtitle">${song_.artists[0].name}</div>
                        </h5>
                        <i class="bi playListPlay bi-play-circle-fill" id="${song_.id}" onclick="songClick('${song_.id}')"></i>
                    </li>`
        })
        container.innerHTML = adder;
    }
    else if ( this.status == 401 ){
        refreshAccessToken();
        // console.log('helloo3');
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

//********    sidebar functions start     **********
function change1(){
    const container = document.getElementById('menu-song');
    const element = document.getElementById('link1');
    if(element.classList.contains('active')){
    }
    else{
        element.classList.add('active');
        container.style.display = "block";

        const element2 = document.getElementById('link2');
        const container2 = document.getElementById('recently-played');
        if(element2.classList.contains('active')){
            element2.classList.remove('active');
            container2.style.display = "none";
        }

        const element3 = document.getElementById('link3');
        const container3 = document.getElementById('recommendations');
        if(element3.classList.contains('active')){
            element3.classList.remove('active');
            container3.style.display = "none";
        }
    }
}

function change2(){
    const container = document.getElementById('recently-played');
    const element = document.getElementById('link2');
    if(element.classList.contains('active')){
    }
    else{
        element.classList.add('active');
        container.style.display = "block";

        const element1 = document.getElementById('link1');
        const container1 = document.getElementById('menu-song');
        if(element1.classList.contains('active')){
            element1.classList.remove('active');
            container1.style.display = "none";
        }

        const element3 = document.getElementById('link3');
        const container3 = document.getElementById('recommendations');
        if(element3.classList.contains('active')){
            element3.classList.remove('active');
            container3.style.display = "none";
        }
    }
}

function change3(){
    const container = document.getElementById('recommendations');
    const element = document.getElementById('link3');
    if(element.classList.contains('active')){
    }
    else{
        element.classList.add('active');
        container.style.display = "block";

        const element1 = document.getElementById('link1');
        const container1 = document.getElementById('menu-song');
        if(element1.classList.contains('active')){
            element1.classList.remove('active');
            container1.style.display = "none";
        }

        const element2 = document.getElementById('link2');
        const container2 = document.getElementById('recently-played');
        if(element2.classList.contains('active')){
            element2.classList.remove('active');
            container2.style.display = "none";
        }
    }
}
//********    sidebar functions end     **********


//********    user data functions     **********

function userClick(){
    const container1 = document.getElementById('content');
    const container2 = document.getElementById('popular_song');
    const container3 = document.getElementById('popular_artists');
    container1.style.display = "none";
    container2.style.display = "none";
    container3.style.display = "none";

    const focus = document.getElementsByClassName('focus');
    focus[0].classList.remove('focus');

    const display = document.getElementById('user-info');
    display.style.display = "block";
}

function navClick1(){
    const element = document.getElementById('nav1');
    if(!element.classList.contains('focus')){
        element.classList.add('focus');
        const element2 = document.getElementById('nav2');
        const element3 = document.getElementById('nav3');
        if(element2.classList.contains('focus'))
        element2.classList.remove('focus');
        else
        element3.classList.remove('focus');

        const container1 = document.getElementById('content');
        const container2 = document.getElementById('popular_song');
        const container3 = document.getElementById('popular_artists');
        container1.style.display = "block";
        container2.style.display = "block";
        container3.style.display = "block";

        const display = document.getElementById('user-info');
        display.style.display = "none";
    }
}

function navClick2(){
    const element = document.getElementById('nav2');
    if(!element.classList.contains('focus')){
        element.classList.add('focus');
        const element1 = document.getElementById('nav1');
        const element3 = document.getElementById('nav3');
        if(element1.classList.contains('focus'))
        element1.classList.remove('focus');
        else
        element3.classList.remove('focus');

        const container1 = document.getElementById('content');
        const container2 = document.getElementById('popular_song');
        const container3 = document.getElementById('popular_artists');
        container1.style.display = "none";
        container2.style.display = "none";
        container3.style.display = "none";

        const display = document.getElementById('user-info');
        display.style.display = "none";
    }
}

function navClick3(){
    const element = document.getElementById('nav3');
    if(!element.classList.contains('focus')){
        element.classList.add('focus');
        const element2 = document.getElementById('nav2');
        const element1 = document.getElementById('nav1');
        if(element2.classList.contains('focus'))
        element2.classList.remove('focus');
        else
        element1.classList.remove('focus');

        const container1 = document.getElementById('content');
        const container2 = document.getElementById('popular_song');
        const container3 = document.getElementById('popular_artists');
        container1.style.display = "none";
        container2.style.display = "none";
        container3.style.display = "none";

        const display = document.getElementById('user-info');
        display.style.display = "none";
    }
}


//********    user data functions     **********


//********    click functions     **********

// const buttons = document.getElementsByClassName('playListPlay');
// buttons.forEach(button => {
//     button.addEventListener('click', buttonPressed);
// })
const songClick = id => {
    console.log(id);
}

const playlistClick = id => {
    // const PLAYLIST_TRACKS = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`;
    // callApi( "GET", PLAYLIST_TRACKS, null, handlePlaylistTracksResponse );
    let body={};
    body.context_uri = "spotify:playlist:" + id;
    body.offset={};
    // callApi( "PUT", PLAY + "?device_id=" + deviceid(), JSON.stringify(body), handlePlayResponse );
}

const artistClick = id => {
    console.log(id);
}

function handlePlayResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    

}

function currentlyPlaying(){
    callApi( "GET", PLAYER + "?market=IN", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.item != null ){
            document.getElementById("poster_master_play").src = data.item.album.images[0].url;
            document.getElementById("title").innerHTML = data.item.name;
            document.getElementById("current_artist").innerHTML = data.item.artists[0].name;
        }


    }
    else if ( this.status == 204 ){

    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}



//********    click functions     **********



const music = new Audio('vande.mp3');

// create Array 

const songs = [
    {
        id:'1',
        songName:` On My Way <br>
        <div class="subtitle">Alan Walker</div>`,
        poster: "img/1.jpg"
    },
    {
        id:'2',
        songName:` Alan Walker-Fade <br>
        <div class="subtitle">Alan Walker</div>`,
        poster: "img/2.jpg"
    },
    // all object type 
    {
        id:"3",
        songName: `Cartoon - On & On <br><div class="subtitle"> Daniel Levi</div>`,
        poster: "img/3.jpg",
    },
    {
        id:"4",
        songName: `Warriyo - Mortals <br><div class="subtitle">Mortals</div>`,
        poster: "img/4.jpg",
    },
    {
        id:"5",
        songName: `Ertugrul Gazi <br><div class="subtitle">Ertugrul</div>`,
        poster: "img/5.jpg",
    },
    {
        id:"6",
        songName: `Electronic Music <br><div class="subtitle">Electro</div>`,
        poster: "img/6.jpg",
    },
    {
        id:"7",
        songName: `Agar Tum Sath Ho <br><div class="subtitle">Tamashaa</div>`,
        poster: "img/7.jpg",
    },
    {
        id:"8",
        songName: `Suna Hai <br><div class="subtitle">Neha Kakker</div>`,
        poster: "img/8.jpg",
    },
    {
        id:"9",
        songName: `Dilber <br><div class="subtitle">Satyameva Jayate</div>`,
        poster: "img/9.jpg",
    },
    {
        id:"10",
        songName: `Duniya <br><div class="subtitle">Luka Chuppi</div>`,
        poster: "img/10.jpg",
    },
    {
        id:"11",
        songName: `Lagdi Lahore Di <br><div class="subtitle">Street Dancer 3D</div>`,
        poster: "img/11.jpg",
    },
    {
        id:"12",
        songName: `Putt Jatt Da <br><div class="subtitle">Putt Jatt Da</div>`,
        poster: "img/12.jpg",
    },
    {
        id:"13",
        songName: `Baarishein <br><div class="subtitle">Atif Aslam</div>`,
        poster: "img/13.jpg",
    },
    {
        id:"14",
        songName: `Vaaste <br><div class="subtitle">Dhvani Bhanushali</div>`,
        poster: "img/14.jpg",
    },
    {
        id:"15",
        songName: `Lut Gaye <br><div class="subtitle">Jubin Nautiyal</div>`,
        poster: "img/15.jpg",
    },
]

Array.from(document.getElementsByClassName('songItem')).forEach((element, i)=>{
    element.getElementsByTagName('img')[0].src = songs[i].poster;
    element.getElementsByTagName('h5')[0].innerHTML = songs[i].songName;
})


let masterPlay = document.getElementById('masterPlay');
let wave = document.getElementsByClassName('wave')[0];

masterPlay.addEventListener('click',()=>{
    if (music.paused || music.currentTime <=0) {
        music.play();
        masterPlay.classList.remove('bi-play-fill');
        masterPlay.classList.add('bi-pause-fill');
        wave.classList.add('active2');
    } else {
        music.pause();
        masterPlay.classList.add('bi-play-fill');
        masterPlay.classList.remove('bi-pause-fill');
        wave.classList.remove('active2');
    }
} )


const makeAllPlays = () =>{
    Array.from(document.getElementsByClassName('playListPlay')).forEach((element)=>{
            element.classList.add('bi-play-circle-fill');
            element.classList.remove('bi-pause-circle-fill');
    })
}
const makeAllBackgrounds = () =>{
    Array.from(document.getElementsByClassName('songItem')).forEach((element)=>{
            element.style.background = "rgb(105, 105, 170, 0)";
    })
}

let index = 0;
let poster_master_play = document.getElementById('poster_master_play');
let title = document.getElementById('title');
Array.from(document.getElementsByClassName('playListPlay')).forEach((element)=>{
    element.addEventListener('click', (e)=>{
    
/* 
Check if the music is already being played or not.

If already played then to pause the music, change the icon from pause to play, change masterplay button from pause to play.
If not already being played, then continue old logic  

*/

        if(e.target.classList.contains("bi-play-circle-fill"))
        {
            index = e.target.id;
            makeAllPlays();
            e.target.classList.remove('bi-play-circle-fill');
            e.target.classList.add('bi-pause-circle-fill');
            music.src = `audio/${index}.mp3`;
            poster_master_play.src =`img/${index}.jpg`;
            music.play();
            let song_title = songs.filter((ele)=>{
                return ele.id == index;
            })

            song_title.forEach(ele =>{
                let {songName} = ele;
                title.innerHTML = songName;
            })
            masterPlay.classList.remove('bi-play-fill');
            masterPlay.classList.add('bi-pause-fill');
            wave.classList.add('active2');
            music.addEventListener('ended',()=>{
                masterPlay.classList.add('bi-play-fill');
                masterPlay.classList.remove('bi-pause-fill');
                wave.classList.remove('active2');
            })
            makeAllBackgrounds();
            Array.from(document.getElementsByClassName('songItem'))[`${index-1}`].style.background = "rgb(105, 105, 170, .1)";
        }
        else{
            index = e.target.id;
            makeAllPlays();
            e.target.classList.remove('bi-pause-circle-fill');
            e.target.classList.add('bi-play-circle-fill');
            music.pause();
            masterPlay.classList.remove('bi-pause-fill');
            masterPlay.classList.add('bi-play-fill');
            wave.classList.remove('active2');
        }
    })
})


let currentStart = document.getElementById('currentStart');
let currentEnd = document.getElementById('currentEnd');
let seek = document.getElementById('seek');
let bar2 = document.getElementById('bar2');
let dot = document.getElementsByClassName('dot')[0];

music.addEventListener('timeupdate',()=>{
    let music_curr = music.currentTime;
    let music_dur = music.duration;

    let min = Math.floor(music_dur/60);
    let sec = Math.floor(music_dur%60);
    if (sec<10) {
        sec = `0${sec}`
    }
    currentEnd.innerText = `${min}:${sec}`;

    let min1 = Math.floor(music_curr/60);
    let sec1 = Math.floor(music_curr%60);
    if (sec1<10) {
        sec1 = `0${sec1}`
    }
    currentStart.innerText = `${min1}:${sec1}`;

    let progressbar = parseInt((music.currentTime/music.duration)*100);
    seek.value = progressbar;
    let seekbar = seek.value;
    bar2.style.width = `${seekbar}%`;
    dot.style.left = `${seekbar}%`;
})

seek.addEventListener('change', ()=>{
    music.currentTime = seek.value * music.duration/100;
})

music.addEventListener('ended', ()=>{
    masterPlay.classList.add('bi-play-fill');
    masterPlay.classList.remove('bi-pause-fill');
    wave.classList.remove('active2');
})


let vol_icon = document.getElementById('vol_icon');
let vol = document.getElementById('vol');
let vol_dot = document.getElementById('vol_dot');
let vol_bar = document.getElementsByClassName('vol_bar')[0];

vol.addEventListener('change', ()=>{
    if (vol.value == 0) {
        vol_icon.classList.remove('bi-volume-down-fill');
        vol_icon.classList.add('bi-volume-mute-fill');
        vol_icon.classList.remove('bi-volume-up-fill');
    }
    if (vol.value > 0) {
        vol_icon.classList.add('bi-volume-down-fill');
        vol_icon.classList.remove('bi-volume-mute-fill');
        vol_icon.classList.remove('bi-volume-up-fill');
    }
    if (vol.value > 50) {
        vol_icon.classList.remove('bi-volume-down-fill');
        vol_icon.classList.remove('bi-volume-mute-fill');
        vol_icon.classList.add('bi-volume-up-fill');
    }

    let vol_a = vol.value;
    vol_bar.style.width = `${vol_a}%`;
    vol_dot.style.left = `${vol_a}%`;
    music.volume = vol_a/100;
})



let back = document.getElementById('back');
let next = document.getElementById('next');

back.addEventListener('click', ()=>{
    index -= 1;
    if (index < 1) {
        index = Array.from(document.getElementsByClassName('songItem')).length;
    }
    music.src = `audio/${index}.mp3`;
    poster_master_play.src =`img/${index}.jpg`;
    music.play();
    let song_title = songs.filter((ele)=>{
        return ele.id == index;
    })

    song_title.forEach(ele =>{
        let {songName} = ele;
        title.innerHTML = songName;
    })
    makeAllPlays()

    document.getElementById(`${index}`).classList.remove('bi-play-fill');
    document.getElementById(`${index}`).classList.add('bi-pause-fill');
    makeAllBackgrounds();
    Array.from(document.getElementsByClassName('songItem'))[`${index-1}`].style.background = "rgb(105, 105, 170, .1)";
    
})
next.addEventListener('click', ()=>{
    index -= 0;
    index += 1;
    if (index > Array.from(document.getElementsByClassName('songItem')).length) {
        index = 1;
        }
    music.src = `audio/${index}.mp3`;
    poster_master_play.src =`img/${index}.jpg`;
    music.play();
    let song_title = songs.filter((ele)=>{
        return ele.id == index;
    })

    song_title.forEach(ele =>{
        let {songName} = ele;
        title.innerHTML = songName;
    })
    makeAllPlays()

    document.getElementById(`${index}`).classList.remove('bi-play-fill');
    document.getElementById(`${index}`).classList.add('bi-pause-fill');
    makeAllBackgrounds();
    Array.from(document.getElementsByClassName('songItem'))[`${index-1}`].style.background = "rgb(105, 105, 170, .1)";
    
})


let left_scroll = document.getElementById('left_scroll');
let right_scroll = document.getElementById('right_scroll');
let pop_song = document.getElementsByClassName('pop_song')[0];

left_scroll.addEventListener('click', ()=>{
    pop_song.scrollLeft -= 330;
})
right_scroll.addEventListener('click', ()=>{
    pop_song.scrollLeft += 330;
})


let left_scrolls = document.getElementById('left_scrolls');
let right_scrolls = document.getElementById('right_scrolls');
let item = document.getElementsByClassName('item')[0];

left_scrolls.addEventListener('click', ()=>{
    item.scrollLeft -= 330;
})
right_scrolls.addEventListener('click', ()=>{
    item.scrollLeft += 330;
})
