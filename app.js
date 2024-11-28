// async function getSongs() {
//     const a = await fetch("http://127.0.0.1:3000/Spotify-clone/songs/")
//     let response = await a.text()
//     console.log(response)
//     let div = document.createElement("div")
//     div.innerHTML = response
//     let as = div.getElementsByTagName("a")
//     let songs = []
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split("128-")[1])
//         }
//     }
//     return songs
// }

// const playmusic = (track)=>{
//     let audio = new Audio(track)
//     audio.play()
// }

// async function main() {
//     let songs = await getSongs()
//     console.log(songs)
//     let songul = document.querySelector(".librarylist").getElementsByTagName("ul")[0]
//     for (const song of songs) {
//         songul.innerHTML = songul.innerHTML + `

//         <li>
//         <div class="play-card">
//             <div class="img-info">
//                 <img src="assets/music.svg" alt="">
//                 <div class="song-info">
//                   <h4>${String(song).replaceAll("%20", " ")}</h4>
//                   <p>Artist name</p>
//                 </div>
//             </div>
//             <img class="playimg" src="assets/play-button.png" alt="play">
//         </div>
//         </li>
//     `
//     }

//     Array.from(document.querySelector(".librarylist").getElementsByTagName("li")).forEach(e=>{
//         e.addEventListener("click", element=>{
//             console.log(e.querySelector(".song-info").getElementsByTagName("h4")[0].innerHTML)
//             playmusic(e.querySelector(".song-info").getElementsByTagName("h4").innerHTML)
//         })
//     })
// }
// main()

let playsong = new Audio();
let songs = [];
let currfolder;
let librarylist = document.querySelector(".librarylist");
let playbar = document.querySelector(".playbar");

async function getSongs(folder) {
    try {
        currfolder = folder;
        const response = await fetch(`https://spotifyaryak.freewebhostmost.com/${folder}/`);
        const text = await response.text();

        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        let extractedSongs = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                extractedSongs.push(decodeURIComponent(element.href)); // Decode to avoid %20
            }
        }

        return extractedSongs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}



function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function playmusic(track) {
    playsong.src = `https://spotifyaryak.freewebhostmost.com/${currfolder}/${track}`;
    playsong.play();
    document.querySelector("#play").src = "assets/pause.svg";
    const songname = track.replaceAll("%20", " ");
    document.querySelector(".song-inform").innerHTML = songname;
}

async function main() {
    async function displayAlbums() {
        
        console.log("Displaying albums");
        let cards = document.querySelector(".albums");
        let response = await fetch("https://spotifyaryak.freewebhostmost.com/songs/");
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");

        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];


            if (e.href.includes("/songs")) {
                let folder = e.href.split("/").slice(-2)[0].replace("%20", " ");
                let response = await fetch(`https://spotifyaryak.freewebhostmost.com/songs/${folder}/info.json`);
                let text = await response.json();

                cards.innerHTML += `
              <div data-folder="${folder}" class="card">
                <button><img src="assets/play.svg" alt=""></button>
                <img src="https://spotifyaryak.freewebhostmost.com/songs/${folder}/cover.png" alt="${text.title}">
                <h4>${text.title}</h4>
                <p>${text.description}</p>
              </div>
            `;
            }
        };
        
        songs = await getSongs("songs/Aashiqui 2");
        
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async (items) => {
                document.querySelector(".left-container").classList.remove("leftdisplay")
                librarylist.classList.remove("display")
                songs = await getSongs(`songs/${items.currentTarget.dataset.folder}`);
                const songul = document.querySelector(".librarylist ul");
                songul.innerHTML = "";

                songs.forEach(song => {
                    const songName = decodeURIComponent(song.split('/').pop().replace(".mp3", ""));
                    songul.innerHTML += `
                    <li>
                        <div class="play-card">
                            <div class="img-info">
                                <img src="assets/music.svg" alt="">
                                <div class="song-info">
                                    <h4>${songName}</h4>
                                    <p>Artist name</p>
                                </div>
                            </div>
                            <img class="playimg" src="assets/play-button.png" alt="play">
                        </div>
                    </li>`;
                });

                Array.from(songul.getElementsByTagName("li")).forEach((li, index) => {
                    li.addEventListener("click", () => {
                        playbar.classList.remove("display2")
                        playmusic(songs[index].split('/').pop());
                    });
                });
            });
        });
    }

    displayAlbums()


    document.querySelector("#play").addEventListener("click", () => {
        if (playsong.paused) {
            playsong.play();
            document.querySelector("#play").src = "assets/pause.svg";
        } else {
            playsong.pause();
            document.querySelector("#play").src = "assets/play-button.png";
        }
    });

    playsong.addEventListener("timeupdate", () => {
        const songduration = document.querySelector(".song-duration");
        const seekbar = document.getElementById("seek");

        const currentTime = playsong.currentTime || 0;
        const totalDuration = playsong.duration || 0;

        songduration.innerHTML = `${formatTime(currentTime)} / ${formatTime(totalDuration)}`;
        seekbar.value = (currentTime / totalDuration) * 100 || 0;
    });

    document.getElementById("seek").addEventListener("input", (event) => {
        const seekValue = event.target.value;
        const totalDuration = playsong.duration || 0;
        playsong.currentTime = (seekValue / 100) * totalDuration;
    });

    document.querySelector("#previous").addEventListener("click", () => {
        // Debugging: Log current song and songs array
        console.log("Previous button clicked");
        console.log("Current song:", playsong.src);
        console.log("Songs array:", songs);

        // Extract the current track name from playsong.src
        const currentTrack = decodeURIComponent(playsong.src.split('/').pop());
        console.log("Current track name:", currentTrack);

        // Find the current track index in the songs array
        const currentIndex = songs.findIndex(song => decodeURIComponent(song.split('/').pop()) === currentTrack);

        if (currentIndex > 0) {
            const previousTrack = songs[currentIndex - 1].split('/').pop();
            console.log("Playing previous track:", previousTrack);
            playmusic(previousTrack);
        } else {
            console.log("No previous track available");
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        // Debugging: Log current song and songs array
        console.log("Next button clicked");
        console.log("Current song:", playsong.src);
        console.log("Songs array:", songs);

        // Extract the current track name from playsong.src
        const currentTrack = decodeURIComponent(playsong.src.split('/').pop());
        console.log("Current track name:", currentTrack);

        // Find the current track index in the songs array
        const currentIndex = songs.findIndex(song => decodeURIComponent(song.split('/').pop()) === currentTrack);

        if (currentIndex < songs.length - 1) {
            const nextTrack = songs[currentIndex + 1].split('/').pop();
            console.log("Playing next track:", nextTrack);
            playmusic(nextTrack);
        } else {
            console.log("No next track available");
        }
    });

    document.getElementById("volume").value = 50;

    document.getElementById("volume").addEventListener("input", (e) => {
        playsong.volume = e.target.value / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("assets/volume.svg", "assets/mute.svg")
            playsong.volume = 0;
            document.getElementById("volume").value = 0;
        }
        else {
            e.target.src = e.target.src.replace("assets/mute.svg", "assets/volume.svg")
            playsong.volume = 1;
            document.getElementById("volume").value = 50;
        }

    })

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left-container").classList.remove("leftdisplay")
    })
    document.querySelector(".left-container").addEventListener("click", ()=>{
        document.querySelector(".left-container").classList.add("leftdisplay")
    })
}

main();
