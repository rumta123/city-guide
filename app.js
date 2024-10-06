let events = [];
let schedule = [];
let visitHistory = [];
let reviews = [];
let places = []; // Correctly declare places as an array
let frontURL = 'http://127.0.0.1:5500/';

// проверка апи
function checkHTML5Support() {
    let supportMessage = 'Поддержка HTML5 API:';
    if ("geolocation" in navigator) {
        supportMessage += '\n - Geolocation API: поддерживается';
    } else {
        supportMessage += '\n - Geolocation API: не поддерживается';
    }
    if ("localStorage" in window) {
        supportMessage += '\n - LocalStorage: поддерживается';
    } else {
        supportMessage += '\n - LocalStorage: не поддерживается';
    }
    const elem = document.createElement('canvas');
    if (!!(elem.getContext && elem.getContext('2d'))) {
        supportMessage += '\n - Canvas API: поддерживается';
    } else {
        supportMessage += '\n - Canvas API: не поддерживается';
    }
    alert(supportMessage);
}

document.addEventListener('DOMContentLoaded', checkHTML5Support);
document.addEventListener('DOMContentLoaded', async () => {
    const places = await fetchPlaces();
    if (places) {
        console.log('places:', places);
        // Дальнейшая обработка данных, например, отображение на странице
        //   displayPlaces(placesData);
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch places data from the server
        const placesResponse = await fetchPlaces();
        if (!placesResponse) {
            throw new Error('Failed to fetch places data');
        }
        places = placesResponse; // Assign fetched places to the global variable

        console.log('Fetched places:', places);

        ymaps.ready(init); // Call init function once Yandex Maps API is ready

    } catch (error) {
        console.error('Error loading places:', error);
    }
});

async function fetchPlaces() {
    try {
        const response = await fetch('http://localhost:3000/places');

        if (!response.ok) {
            throw new Error('Error fetching places data');
        }
        return await response.json();

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}



function init() {
    const map = new ymaps.Map('map', {
        center: [55.753994, 37.622093], // Moscow coordinates
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl']
    });

    // Получаем текущее местоположение пользователя
    ymaps.geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
    }).then(function (result) {
        // Центрируем карту по местоположению пользователя
        map.setCenter(result.geoObjects.get(0).geometry.getCoordinates());

        // Создаем маркер для текущего местоположения пользователя
        var userMarker = new ymaps.Placemark(result.geoObjects.get(0).geometry.getCoordinates(), {
            hintContent: 'Ваше местоположение'
        }, {
            preset: 'islands#blueCircleDotIcon',
            draggable: false
        });
        map.geoObjects.add(userMarker);
    });
    // подсчет растояния из точки А в точку B
    var pointA, pointB;
    var currentRoute;

    // Обработчик клика по карте для добавления маркеров
    map.events.add('click', function (e) {
        var clickedCoordinates = e.get('coords');

        if (!pointA) {
            pointA = new ymaps.Placemark(clickedCoordinates, {
                hintContent: 'Точка А',
                balloonContent: 'Точка А'
            }, {
                preset: 'islands#redCircleDotIcon',
                draggable: false
            });
            map.geoObjects.add(pointA);
        } else if (!pointB) {
            pointB = new ymaps.Placemark(clickedCoordinates, {
                hintContent: 'Точка Б',
                balloonContent: 'Точка Б'
            }, {
                preset: 'islands#blueCircleDotIcon',
                draggable: false
            });
            map.geoObjects.add(pointB);

            // Строим маршрут между точкой А и точкой Б
            ymaps.route([pointA.geometry.getCoordinates(), pointB.geometry.getCoordinates()]).then(function (route) {
                if (currentRoute) {
                    map.geoObjects.remove(currentRoute);
                }
                currentRoute = route;
                map.geoObjects.add(route);

                var distance = route.getLength();
                document.getElementById('distance').textContent = 'Расстояние по маршруту:<b> ' + distance.toFixed(2) + '</> метров';
                console.log('Расстояние по маршруту:', distance);
            });
        } else {
            // Если обе точки уже установлены, сбрасываем их и создаем новые
            map.geoObjects.remove(pointA);
            map.geoObjects.remove(pointB);
            if (currentRoute) {
                map.geoObjects.remove(currentRoute);
            }

            pointA = new ymaps.Placemark(clickedCoordinates, {
                hintContent: 'Точка А',
                balloonContent: 'Точка А'
            }, {
                preset: 'islands#redCircleDotIcon',
                draggable: false
            });
            map.geoObjects.add(pointA);
            pointB = null;
            currentRoute = null;
            document.getElementById('distance').textContent = '';
        }
    });



    // Добавим функцию для определения текущего местоположения пользователя
ymaps.geolocation.get({
    // Запрашиваем точку доступа к геолокации пользователя
    // В данном примере дополнительные параметры не указываем
}).then(function (result) {
    // Пользователь успешно разрешил доступ к геопозиции
    const userPosition = result.geoObjects.get(0).geometry.getCoordinates();

    // Создаем маркер для местоположения пользователя
    const userMarker = new ymaps.Placemark(userPosition, {
        iconCaption: 'Ваше местоположение'
    }, {
        preset: 'islands#blueCircleDotIconWithCaption'
    });

    map.geoObjects.add(userMarker);

    // Добавляем обработчик клика по маркеру пользователя
    userMarker.events.add('click', function (e) {
        // Здесь можно добавить дополнительную логику при клике на маркер пользователя
        alert('Вы здесь!');
    });

    // Проверяем расстояние до каждого места
    places.forEach(place => {
        const distance = ymaps.coordSystem.geo.getDistance(userPosition, place.coordinates);
        console.log('distance', distance);
        if (distance <= 10000000) { // Проверяем, находится ли пользователь в радиусе 1000 метров от места
            alert(`Вы находитесь рядом с ${place.name} (${distance.toFixed()} метров), описание: ${place.description},  категория: ${place.categories.map(cat => cat.name).join(', ')}`);
            playAudioGuide1(place);
          
         
        
            // playAudioGuide(place); // Воспроизводим аудиогид, если он есть
            // Здесь можно выполнить дополнительные действия для мест, которые находятся "рядом"
        }
    });
}, function (error) {
    // В случае ошибки выводим ее текст
    alert('Ошибка при определении местоположения: ' + error.message);
});









    // Your existing map setup code goes here...

    // Example usage: showing markers for selected categories
    document.getElementById('category1').addEventListener('change', updateMarkers);
    document.getElementById('category2').addEventListener('change', updateMarkers);
    document.getElementById('category3').addEventListener('change', updateMarkers);

    updateMarkers();

    // Function to update markers based on selected categories
    function updateMarkers() {
        const categoriesToShow = [];
        if (document.getElementById('category1').checked) categoriesToShow.push({ id: 1, name: 'Достопримечательности' });
        if (document.getElementById('category2').checked) categoriesToShow.push({ id: 2, name: 'Рестораны' });
        if (document.getElementById('category3').checked) categoriesToShow.push({ id: 3, name: 'Интересные места' });

        showMarkersByCategories(categoriesToShow);
    }

    // Function to display markers on the map based on selected categories
    function showMarkersByCategories(categoriesToShow) {
        try {

            map.geoObjects.removeAll(); // Clear existing markers

            places.forEach(place => {
                if (categoriesToShow.some(category => place.categories.some(cat => cat.id === category.id))) {
                    const placemark = new ymaps.Placemark(place.coordinates, {
                        hintContent: place.name,
                        balloonContentHeader: place.name,
                        balloonContentBody: `
                            <div>
                                <p><strong>Описание:</strong> ${place.description}</p>
                                <p><strong>Категории:</strong> ${place.categories.map(cat => cat.name).join(', ')}</p>
                                   ${place.audio ? `
                                <div id="audioPlayerContainer-${place.id}">
                                    <audio id="audioPlayer-${place.id}" controls>
                                        <source id="audioSource-${place.id}" src="${frontURL + place.audio}" type="audio/mpeg">
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            ` : ''}
                         
                            </div>
                        `
                    });

                    map.geoObjects.add(placemark);

                    placemark.events.add('click', function (e) {
                        fetchPlaces()
                        const target = e.get('target');
                        map.balloon.open(target.geometry.getCoordinates(), {
                            contentHeader: target.properties.get('balloonContentHeader'),
                            contentBody: `
                                <div>
                                    <p><strong>Описание:</strong> ${place.description}</p>
                                    <p><strong>Категории:</strong> ${place.categories.map(cat => cat.name).join(', ')}</p>
                                </div>
                            `
                        });

                        console.log('Marker clicked:', place); // Выводим place при клике на маркер

                        playAudioGuide(place);
                        showReviewForm(place);
                        updateReviewsUI(place);
                        updatePhotosUI(place);
                    });
                }
            });
        } catch (error) {
            console.error('Error displaying places:', error);
        }
    }


}

function playAudioGuide1(place) {
    // const audioPlayerContainer = document.getElementById('audioPlayerContainer');
    const audioPlayer = document.getElementById('audioPlayer1');
    const audioSource = document.getElementById('audioSource1');

    // Указываем базовый URL к вашему серверу
    // const baseURL = 'http://localhost:3000/';

    if (place.audio) {
        const audioURL = frontURL + place.audio; // Склеиваем базовый URL и путь к аудиофайлу
        console.log('Audio URL:', audioURL); // Выводим в консоль для проверки

        audioSource.src = audioURL; // Устанавливаем путь к аудиофайлу
        audioPlayer.load();
        audioPlayerContainer.classList.add('show'); // Показываем контейнер перед воспроизведением
        audioPlayer.play(); // Запускаем воспроизведение аудио
    } else {
        audioPlayerContainer.classList.remove('show');
        audioPlayer.pause(); // Останавливаем воспроизведение, если нет аудио
    }
}

function playAudioGuide(place) {
    // const audioPlayerContainer = document.getElementById('audioPlayerContainer');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');

    // Указываем базовый URL к вашему серверу
    // const baseURL = 'http://localhost:3000/';

    if (place.audio) {
        const audioURL = frontURL + place.audio; // Склеиваем базовый URL и путь к аудиофайлу
        console.log('Audio URL:', audioURL); // Выводим в консоль для проверки

        audioSource.src = audioURL; // Устанавливаем путь к аудиофайлу
        audioPlayer.load();
        audioPlayerContainer.classList.add('show'); // Показываем контейнер перед воспроизведением
        audioPlayer.pause(); // Запускаем воспроизведение аудио
    } else {
        audioPlayerContainer.classList.remove('show');
        audioPlayer.pause(); // Останавливаем воспроизведение, если нет аудио
    }
}


// форма записи
function showReviewForm(place) {
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    reviewFormContainer.style.display = 'block';
    document.getElementById('placeName').textContent = place.name;
    document.getElementById('reviewAuthor').value = '';
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewRating').value = '1';
    const markVisitedButton = document.getElementById('markVisitedButton');

    document.getElementById('addReviewButton').onclick = function () {
        addReview(place);
    };

    document.getElementById('photoInput').onchange = function () {
        handlePhotoUpload(place);
    };

    markVisitedButton.onclick = function () {
        addToVisitHistory(place.name);
        reviewFormContainer.style.display = 'none';
    }
}
// запись отзыва
async function addReview(place) {
    const author = document.getElementById('reviewAuthor').value;
    const text = document.getElementById('reviewText').value;
    const rating = parseInt(document.getElementById('reviewRating').value);

    const review = { author: author, text: text, rating: rating };

    try {
        // Отправка отзыва на сервер для конкретного места
        const response = await fetch(`http://localhost:3000/places/${place.id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(review),
        });

        if (!response.ok) {
            throw new Error('Ошибка при добавлении отзыва');
        }

        // Получаем обновленные данные места с сервера
        const updatedPlaceResponse = await fetch(`http://localhost:3000/places/${place.id}`);
        if (!updatedPlaceResponse.ok) {
            throw new Error('Ошибка при получении обновленных данных места');
        }
        const updatedPlace = await updatedPlaceResponse.json();

        // Проверяем, есть ли обновленные отзывы
        if (updatedPlace && updatedPlace.reviews) {
            // Обновляем данные о месте на клиенте
            place.reviews = updatedPlace.reviews;
        } else {
            throw new Error('Обновленные отзывы не получены');
        }

        // Обновляем UI только для выбранного места
        updateReviewsUI(place);
        updateAverageRating(place);

        // Очистка полей формы после добавления отзыва
        document.getElementById('reviewAuthor').value = '';
        document.getElementById('reviewText').value = '';
        document.getElementById('reviewRating').value = '1';
    } catch (error) {
        console.error('Error adding review:', error);
    }
}


// Функция для обновления UI с новыми отзывами
function updateReviewsUI(place) {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';

    // Проверяем, что place.reviews существует и является массивом
    if (place.reviews && Array.isArray(place.reviews)) {
        place.reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.id = `review-${review.id}`; // Присваиваем id элементу для удаления
            reviewElement.innerHTML = `
                <p><strong>Автор:</strong> ${review.author}</p>
                <p><strong>Отзыв:</strong> ${review.text}</p>
                <p><strong>Рейтинг:</strong> ${review.rating}</p>
                <button onclick="deleteReview(${place.id}, ${review.id})">Удалить отзыв</button>
            `;
            reviewsContainer.appendChild(reviewElement);
        });
    } else {
        console.error('Ошибка: список отзывов для места не найден или некорректен');
    }
}


// Функция для обновления среднего рейтинга места
function updateAverageRating(place) {
    const reviews = place.reviews;
    let totalRating = 0;

    reviews.forEach(review => {
        totalRating += review.rating;
    });

    const averageRating = totalRating / reviews.length;
    console.log('averageRating', averageRating);

    const averageRatingElement = document.getElementById('average-rating-all');
    averageRatingElement.textContent = `Средний рейтинг для места ${averageRating.toFixed(1)}`;
}


// удаление отзыва
async function deleteReview(placeId, reviewId) {
    try {
        const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении отзыва');
        }

        // После успешного удаления отзыва, обновляем данные места на клиенте
        const updatedPlaceResponse = await fetch(`http://localhost:3000/places/${placeId}`);
        if (!updatedPlaceResponse.ok) {
            throw new Error('Ошибка при получении обновленных данных места');
        }
        const updatedPlace = await updatedPlaceResponse.json();

        // Обновляем данные о месте на клиенте, если нужно
        updateReviewsUI(updatedPlace);
        updateAverageRating(updatedPlace);

        // Пример обновления UI: удаляем отзыв из интерфейса
        const reviewsContainer = document.getElementById('reviews-container');
        const reviewElementToRemove = document.getElementById(`review-${reviewId}`);
        if (reviewElementToRemove) {
            reviewsContainer.removeChild(reviewElementToRemove);
        } else {
            console.warn(`Отзыв с id ${reviewId} не найден в UI`);
        }
    } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
    }
}


function handlePhotoUpload(place) {
    const fileInput = document.getElementById('photoInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoData = e.target.result;

            // Создаем копию объекта place.photos, чтобы избежать ссылочных проблем
            place.photos = [...place.photos, photoData];

            updatePhotosUI(place);
        };
        reader.readAsDataURL(file);
    }
}

function updatePhotosUI(place) {
    const photosContainer = document.getElementById('photosContainer');
    photosContainer.innerHTML = '';

    if (place.photos && Array.isArray(place.photos)) {
        place.photos.forEach(photoData => {
            const img = document.createElement('img');
            img.src = photoData;
            img.alt = 'Фото места';
            photosContainer.appendChild(img);
        });
    } else {
        console.error('Ошибка: список фотографий для места не найден или некорректен');
    }
}
async function fetchEvents() {
    const response = await fetch('http://localhost:3000/events');
    const data = await response.json();
    console.log('events', data)
    displayEvents(data);
}

function displayEvents(events) {
    const eventsList = document.getElementById('events');
    eventsList.innerHTML = '';

    events.forEach((event, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${event.name} - ${new Date(event.date).toLocaleString()}`;

        const addToScheduleButton = document.createElement('button');
        addToScheduleButton.textContent = 'Добавить в ваше расписание';
        const removeFromScheduleButton = document.createElement('button');
        removeFromScheduleButton.textContent = 'Удалить из расписания';

        addToScheduleButton.addEventListener('click', () => addToSchedule(index));
        removeFromScheduleButton.addEventListener('click', () => deleteEvent(index));

        listItem.appendChild(addToScheduleButton);
        listItem.appendChild(removeFromScheduleButton);
        eventsList.appendChild(listItem);
    });
}

// Вызов функции для загрузки данных при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchEvents);

async function addEvent() {
    const eventNameInput = document.getElementById('eventNameInput').value.trim();
    const eventDateInput = document.getElementById('eventDateInput').value;

    if (!eventNameInput || !eventDateInput) {
        alert('Пожалуйста, заполните все поля для добавления события.');
        return;
    }

    const newEvent = { name: eventNameInput, date: new Date(eventDateInput) };

    try {
        const response = await fetch('http://localhost:3000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent),
        });
        if (!response.ok) {
            throw new Error('Ошибка при добавлении события');
        }
        await fetchEvents(); // Обновление списка событий
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function updateEvent(index) {
    const eventNameInput = document.getElementById('eventNameInput').value.trim();
    const eventDateInput = document.getElementById('eventDateInput').value;

    if (!eventNameInput || !eventDateInput) {
        alert('Пожалуйста, заполните все поля для сохранения изменений.');
        return;
    }

    const updatedEvent = { name: eventNameInput, date: new Date(eventDateInput) };

    try {
        const response = await fetch(`http://localhost:3000/events/${index}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEvent),
        });
        if (!response.ok) {
            throw new Error('Ошибка при обновлении события');
        }
        await fetchEvents(); // Обновление списка событий
    } catch (error) {
        console.error('Ошибка:', error);
    }
}
// удалить событие
async function deleteEvent(index) {
    try {
        // Получаем текущий список событий с сервера
        const response1 = await fetch('http://localhost:3000/events');
        const events = await response1.json();

        // Проверяем, что events[index] существует
        if (!events[index]) {
            console.error('Событие для удаления не найдено.');
            return;
        }

        // Получаем id события для удаления
        const eventIdToDelete = events[index].id;

        // Отправляем запрос DELETE на сервер
        const response = await fetch(`http://localhost:3000/events/${eventIdToDelete}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении события');
        }

        // Удаляем событие из массива events
        events.splice(index, 1);

        // Обновляем отображение списка событий
        displayEvents(events);
    } catch (error) {
        console.error('Ошибка при удалении события:', error);
    }
}




document.addEventListener('DOMContentLoaded', fetchEvents); // Загрузка событий при загру

// Функция для добавления события в расписание
async function addToSchedule(index) {
    try {
        const response = await fetch('http://localhost:3000/events');
        const events = await response.json();

        // Загружаем данные о событиях, если они ещё не загружены
        if (!events || events.length === 0) {
            await fetchEvents(); // Предположим, что у вас есть функция fetchEvents, которая загружает данные с сервера
            console.log(data)
        }

        // Проверяем, что index допустим
        if (index >= 0 && index < events.length) {
            const eventToAdd = events[index];

            // Получаем текущий список событий из localStorage
            const scheduleList = JSON.parse(localStorage.getItem('scheduleList')) || [];

            // Проверяем, нет ли уже такого события в расписании
            const eventExists = scheduleList.some(event => event.id === eventToAdd.id);
            if (eventExists) {
                console.warn('Это событие уже есть в вашем расписании.');
                alert('это событие уже есть в вашем расписании')
                return;
            }
            // Добавляем новое событие в список
            scheduleList.push(eventToAdd);

            // Сохраняем обновлённый список в localStorage
            localStorage.setItem('scheduleList', JSON.stringify(scheduleList));

            // Обновляем отображение в UI
            updateScheduleUI(scheduleList); // Предположим, что у вас есть функция для обновления расписания в интерфейсе
        } else {
            console.warn('Неверный индекс события.');
        }
    } catch (error) {
        console.error('Ошибка при добавлении события в расписание:', error);
    }
}

// Вызываем функцию для загрузки данных при загрузке страницы
document.addEventListener('DOMContentLoaded', loadScheduleFromLocalStorage);

// Функция для загрузки данных из localStorage и обновления интерфейса
function loadScheduleFromLocalStorage() {
    try {
        // Получаем текущий список событий из localStorage
        const scheduleList = JSON.parse(localStorage.getItem('scheduleList')) || [];

        // Обновляем отображение в UI
        updateScheduleUI(scheduleList);
    } catch (error) {
        console.error('Ошибка при загрузке расписания из localStorage:', error);
    }
}

function updateScheduleUI(scheduleList) {
    const scheduleListElement = document.getElementById('scheduleList');
    scheduleListElement.innerHTML = ''; // Очищаем текущий список

    scheduleList.forEach(event => {
        const listItem = document.createElement('li');
        listItem.textContent = `${event.name} - ${new Date(event.date).toLocaleString()}`;

        const removeFromScheduleButton = document.createElement('button');
        removeFromScheduleButton.textContent = 'Удалить из расписания';
        removeFromScheduleButton.addEventListener('click', () => removeFromSchedule(event));
        listItem.appendChild(removeFromScheduleButton);

        scheduleListElement.appendChild(listItem);
    });
}

function removeFromSchedule(eventToRemove) {
    let scheduleList = JSON.parse(localStorage.getItem('scheduleList')) || [];

    // Удаляем событие из локального хранилища
    scheduleList = scheduleList.filter(event => event.name !== eventToRemove.name); // Пример фильтрации по имени

    localStorage.setItem('scheduleList', JSON.stringify(scheduleList));
    updateScheduleUI(scheduleList);
}



document.addEventListener('DOMContentLoaded', function () {
    const markVisitedButton = document.getElementById('markVisitedButton');
    const historyList = document.getElementById('historyList');

    markVisitedButton.addEventListener('click', function () {
        const placeName = document.getElementById('placeName').textContent; // Get the place name
        markVisited(placeName); // Call markVisited function with the place name
    });

    // Load visited places from localStorage on page load
    loadVisitHistory();

    // Function to mark a place as visited
    function markVisited(placeName) {
        // Perform actions to mark place as visited
        const visitEntry = {
            place: placeName,
            date: new Date()
        };

        addToHistoryList(visitEntry); // Add to history list
        saveVisitToLocalStorage(visitEntry); // Save to localStorage
    }

    // Function to add visit entry to history list
    function addToHistoryList(visitEntry) {
        const listItem = document.createElement('li');
        listItem.textContent = `Место: ${visitEntry.place} - Дата посещения: ${visitEntry.date.toLocaleString()}`;
        alert(`Место: ${visitEntry.place} добавлено в список посещенных`)
        historyList.appendChild(listItem);
    }

    // Function to save visit entry to localStorage
    function saveVisitToLocalStorage(visitEntry) {
        let visits = JSON.parse(localStorage.getItem('visitedPlaces')) || [];
        visits.push(visitEntry);
        localStorage.setItem('visitedPlaces', JSON.stringify(visits));
        console.log('Saved to localStorage:', visits); // Check saved data in console
    }

    // Function to load visited places from localStorage
    function loadVisitHistory() {
        let visits = JSON.parse(localStorage.getItem('visitedPlaces')) || [];
        console.log('Loaded from localStorage:', visits); // Check loaded data in console
        visits.forEach(entry => {
            addToHistoryList(entry);
        });
    }
});

