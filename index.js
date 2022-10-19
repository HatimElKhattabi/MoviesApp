const autoCompleteConfig = {
    renderOption(movie) {
        const imgSearch = movie.Poster === 'N/A' ? '' : movie.Poster;
        return `
        <img src="${imgSearch}" />
        <h1>${movie.Title} ${movie.Year}</h1>
        `;
    },

    inputValue(movie) {
    return movie.Title;
    },
    async fetchData(searchTerm) 
        {
            const response = await axios.get('http://www.omdbapi.com/',
            {
                params: {
                    apikey : 'd640c328',
                    s: searchTerm
                }
            });
        
            if (response.data.Error) {
                return [];
            }
            return response.data.Search;
        }
}

createAutoComplete({
    ...autoCompleteConfig, 
    root: document.querySelector('#left-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
    }
   
});
createAutoComplete({
    ...autoCompleteConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(movie) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(movie,onMovieSelect(movie, document.querySelector('#right-summary'), 'right'))
    }
   
});

let leftMovie;
let rightMovie;
const onMovieSelect = async (movie,summaryElement, side) => {
    const respone = await axios.get('http://www.omdbapi.com/',
    {
        params: {
            apikey : 'd640c328',
            i : movie.imdbID

        }
    });
    summaryElement.innerHTML = movieTemplate(respone.data);

    if (side == 'left') {
        leftMovie = respone.data;
    } else {
        rightMovie = respone.data;
    }

    if (leftMovie && rightMovie) {
        runComparison();
    }
};

const runComparison = () => {
    const leftSideStats = document.querySelectorAll   ('#left-summary .notification');
    const rightSideStats = document.querySelectorAll('#right-summary .notification');

    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index];

        const leftSideValue = parseInt(leftStat.dataset.value);
        const rightSideValue = parseInt(rightStat.dataset.value);

        if (rightSideValue > leftSideValue) {
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-warning');
        } else {
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warning'); 
        }
    })
}


// expanding a summary after the user selects a movie
const movieTemplate = (movieDetail) => {
    const dollars = parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''));
    const metaScore = parseInt(movieDetail.metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

    let count = 0;
    const awards = movieDetail.Awards.split(' ').reduce((prev , word) =>
    {
        const value = parseInt(word);

        if (isNaN(value)) {
            return prev;

        }
        else {
            return prev + value;
        }
    }, 0);
    console.log(awards);

    return `
    <article class="media">
        <figure class="media-left">
            <p class ="image">
                <img src="${movieDetail.Poster}" />
            </p>
        </figure>
        <div class="media-conter">
            <div class="content">
                <h1>${movieDetail.Title}</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>${movieDetail.Plot}</p>
            </div>
        </div>
    </article>

    <article data-value=${awards} class="notification is-primary">
        <p class ="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
    </article>

    <article data-value=${dollars} class="notification is-primary">
        <p class ="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
    </article>

    <article data-value=${metaScore} class="notification is-primary">
        <p class ="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Meta Score</p>
    </article>

    <article data-value=${imdbRating} class="notification is-primary">
        <p class ="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
    </article>

    <article data-value=${imdbVotes} class="notification is-primary">
        <p class ="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
    </article>
    `;
}