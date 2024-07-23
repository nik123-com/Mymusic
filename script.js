console.log("Let's write JavaScript");

let currentsong = new Audio();
let songs = [];
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currfolder = folder;
        let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");
        let songs = [];
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.href.endsWith(".mp3")) {
                songs.push(link.href.split(`/${folder}/`)[1]);
            }
        }
        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

const playmusic = (track) => {
    currentsong.src = `/${currfolder}/` + track;
    currentsong.play();
    document.querySelector("#play").src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function main() {
    songs = await getSongs("songs/ncs");
    console.log(songs);
    let songul = document.querySelector(".songList ul");
    songul.innerHTML = ""; // Clear the previous list to avoid duplication
    for (const song of songs) {
        songul.innerHTML += `<li>
                                <img class="invert" src="music.svg" alt="Music icon">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>N.K</div>
                                </div>
                                <div class="PlayNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="play.svg" alt="play">
                                </div>
                             </li>`;
    }

    document.querySelectorAll(".songList li").forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info div").innerHTML.trim());
        });
    });

    document.querySelector("#play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            document.querySelector("#play").src = "pause.svg";
        } else {
            currentsong.pause();
            document.querySelector("#play").src = "play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Add event listener for volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    currentsong.addEventListener("loadeddata", () => {
        console.log(currentsong.duration, currentsong.currentSrc, currentsong.currentTime);
    });

    // Load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (item) => {
            console.log(item.currentTarget.dataset);
            const folder = item.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            // Update the UI or perform other actions with the new playlist
            songul.innerHTML = ""; // Clear previous playlist
            for (const song of songs) {
                songul.innerHTML += `<li>
                                        <img class="invert" src="music.svg" alt="Music icon">
                                        <div class="info">
                                            <div>${song.replaceAll("%20", " ")}</div>
                                            <div>N.K</div>
                                        </div>
                                        <div class="PlayNow">
                                            <span>Play Now</span>
                                            <img class="invert" src="play.svg" alt="play">
                                        </div>
                                     </li>`;
            }
            // Re-attach event listeners to new list items
            document.querySelectorAll(".songList li").forEach(e => {
                e.addEventListener("click", () => {
                    playmusic(e.querySelector(".info div").innerHTML.trim());
                });
            });
        });
    });
}

main();
