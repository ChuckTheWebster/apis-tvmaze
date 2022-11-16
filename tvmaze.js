"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList")

const BASE_URL = 'http://api.tvmaze.com';
const DEFAULT_IMAGE = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  const searchEndpointUrl = `${BASE_URL}/search/shows`;
  const response = await axios.get(searchEndpointUrl, {params: {q: searchTerm}});

  const shows = response.data.map(function(obj) {
    return {
      id: obj.show.id,
      name: obj.show.name,
      summary: obj.show.summary,
      image: obj.show.image.original || DEFAULT_IMAGE
    };
  });

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt=""
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const episodesEndpointUrl = `${BASE_URL}/shows/${id}/episodes`;
  const response = await axios.get(episodesEndpointUrl);

  const episodes = response.data.map(function(obj) {
    return {
      id: obj.id,
      name: obj.name,
      season: obj.season,
      number: obj.number
    };
  });

  return episodes;
}

/** Given an array of episodes create <li> elements for each episode and populate
 * into the #episodesList part of the DOM
 */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $newEpisode = $('<li>', {text: `${episode.name} (Season ${episode.season}, Episode ${episode.number})`});
    $episodesList.append($newEpisode);
  }

  $episodesArea.show();
}

/** Click handler for episodes buttons. Upon click shows episodes for the given show */

async function getAndPopulateEpisodes(evt) {
  const showId = $(evt.target).parent().parent().parent().attr('data-show-id');
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$('#showsList').on('click', 'button', getAndPopulateEpisodes);