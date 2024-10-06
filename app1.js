ymaps.ready(init);
let events = [];
let schedule = [];
let visitHistory = [];
let reviews = []
const places = {}
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
document.addEventListener('DOMContentLoaded', async () => {
    const places = await fetchPlaces();
    if (places) {
        console.log('places:', places);
        // Дальнейшая обработка данных, например, отображение на странице
        //   displayPlaces(placesData);
    }
});

async function fetchPlaces() {
    try {
        const response = await fetch('http://localhost:3000/places');
        if (!response.ok) {
            throw new Error('Ошибка при получении данных с сервера');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', checkHTML5Support);
function init() {
    const map = new ymaps.Map('map', {
        center: [55.753994, 37.622093], // Москва
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
                document.getElementById('distance').textContent = 'Расстояние по маршруту: ' + distance.toFixed(2) + ' метров';
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

    // const places = [
    //     {
    //         id: 1,
    //         name: 'Красная площадь',
    //         coordinates: [55.753722, 37.621608],
    //         description: 'Историческая площадь в Москве.',
    //         audio: '/audio/2.mp3',
    //         reviews: [],
    //         ratings: [],
    //         photos: [],
    //         categories: ['достопримечательность']
    //     },
    //     {
    //         id: 2,
    //         name: 'Ресторан "Прекрасное место"',
    //         coordinates: [55.755059, 37.614412],
    //         description: 'Отличное место для ужина.',
    //         audio: '/audio/3.mp3',
    //         reviews: [],
    //         ratings: [],
    //         photos: [],
    //         categories: ['ресторан', 'интересное место']
    //     },
    //     {
    //         id: 3,
    //         name: 'ТЦ "Мега"',
    //         coordinates: [55.760431, 37.619933],
    //         description: 'Крупный торговый центр.',
    //         audio: '/audio/1.mp3',
    //         reviews: [],
    //         ratings: [],
    //         photos: [],
    //         categories: ['интересное место']
    //     }
    // ];

    // Функция для отображения маркеров на карте в зависимости от выбранных категорий
    function showMarkersByCategories(categoriesToShow, places) {
        try {
            // Очищаем карту от предыдущих маркеров
            map.geoObjects.removeAll();

            // Фильтруем места по выбранным категориям и добавляем маркеры на карту
            places.forEach(place => {
                if (categoriesToShow.some(category => place.categories.some(cat => cat.name === category.name))) {
                    const placemark = new ymaps.Placemark(place.coordinates, {
                        hintContent: place.name,
                        balloonContentHeader: place.name,
                        balloonContentBody: `
                        <div>
                            <p><strong>Описание:</strong> ${place.description}</p>
                            <p><strong>Категории:</strong> ${place.categories.map(cat => cat.name).join(', ')}</p>
                        </div>
                    `
                    });

                    map.geoObjects.add(placemark);

                    placemark.events.add('click', function (e) {
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

                        showReviewForm(place);
                        updateReviewsUI(place);
                        playAudioGuide(place);
                    });
                }
            });
        } catch (error) {
            console.error('Error displaying places:', error);
        }
    }

    // Пример использования при загрузке страницы
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            // Загружаем данные с сервера
            const response = await fetch('http://localhost:3000/places');
            const placesData = await response.json();

            // Показываем маркеры для выбранных категорий
            showMarkersByCategories([{ id: 1, name: 'Достопримечательности' }], places);
        } catch (error) {
            console.error('Error fetching or displaying places:', error);
        }
    });

    // Функция для отображения маркеров на карте в зависимости от выбранных категорий
    // async function showMarkersByCategories(categoriesToShow) {
    //     // Очищаем карту от предыдущих маркеров
    //     map.geoObjects.removeAll();
    //     const places = await fetchPlaces();
    //     console.log('places 111', places)
    //     // Фильтруем места по выбранным категориям и добавляем маркеры на карту
    //     places.forEach(place => {
    //         if (categoriesToShow.some(category => place.categories.includes(category))) {
    //             const placemark = new ymaps.Placemark(place.coordinates, {
    //                 hintContent: place.name,
    //                 balloonContentHeader: place.name,
    //                 balloonContentBody: `
    //             <div>
    //                 <p><strong>Описание:</strong> ${place.description}</p>
    //                 <p><strong>Категории:</strong> ${place.categories.join(', ')}</p>
    //             </div>
    //         `
    //             });

    //             map.geoObjects.add(placemark);

    //             placemark.events.add('click', function (e) {
    //                 const target = e.get('target');
    //                 map.balloon.open(target.geometry.getCoordinates(), {
    //                     contentHeader: target.properties.get('balloonContentHeader'),
    //                     contentBody: `
    //                 <div>
    //                     <p><strong>Описание:</strong> ${place.description}</p>
    //                     <p><strong>Категории:</strong> ${place.categories.join(', ')}</p>
    //                 </div>
    //             `
    //                 });

    //                 showReviewForm(place);
    //                 updateReviewsUI(place);
    //                 playAudioGuide(place);
    //             });
    //         }
    //     });
    // }

    //     // Инициализация фильтра по категориям
    //     const category1Checkbox = document.getElementById('category1');
    //     const category2Checkbox = document.getElementById('category2');
    //     const category3Checkbox = document.getElementById('category3');

    //     // Обработчики изменений в чекбоксах
    //     category1Checkbox.addEventListener('change', updateMarkers);
    //     category2Checkbox.addEventListener('change', updateMarkers);
    //     category3Checkbox.addEventListener('change', updateMarkers);

    //     // Функция обновления маркеров при изменении выбранных категорий
    //     function updateMarkers() {
    //         const categoriesToShow = [];
    //         if (category1Checkbox.checked) categoriesToShow.push('достопримечательность');
    //         if (category2Checkbox.checked) categoriesToShow.push('ресторан');
    //         if (category3Checkbox.checked) categoriesToShow.push('интересное место');

    //         showMarkersByCategories(categoriesToShow);
    //     }

    //     // Показываем все маркеры по умолчанию
    //     updateMarkers();


    //     places.forEach(place => {
    //         const placemark = new ymaps.Placemark(place.coordinates, {
    //             hintContent: place.name,
    //             balloonContentHeader: place.name,
    //             balloonContentBody: `
    //     <div>
    //         <p><strong>Описание:</strong> ${place.description}</p>
    //         <p><strong>Категории:</strong> ${place.categories.join(', ')}</p>
    //     </div>
    // `
    //         });

    //         map.geoObjects.add(placemark);

    //         placemark.events.add('click', function (e) {
    //             const target = e.get('target');
    //             map.balloon.open(target.geometry.getCoordinates(), {
    //                 contentHeader: target.properties.get('balloonContentHeader'),
    //                 contentBody: `
    //         <div>
    //             <p><strong>Описание:</strong> ${place.description}</p>
    //             <p><strong>Категории:</strong> ${place.categories.join(', ')}</p>
    //         </div>
    //     `
    //             });

    //             showReviewForm(place);
    //             updateReviewsUI(place);
    //             playAudioGuide(place);
    //         });
    //     });


    // Инициализация фильтра по категориям
    const category1Checkbox = document.getElementById('category1');
    const category2Checkbox = document.getElementById('category2');
    const category3Checkbox = document.getElementById('category3');

    // Обработчики изменений в чекбоксах
    category1Checkbox.addEventListener('change', updateMarkers);
    category2Checkbox.addEventListener('change', updateMarkers);
    category3Checkbox.addEventListener('change', updateMarkers);

    // Функция обновления маркеров при изменении выбранных категорий
    function updateMarkers() {
        const categoriesToShow = [];
        if (category1Checkbox.checked) categoriesToShow.push({ id: 1, name: 'Достопримечательности' });
        if (category2Checkbox.checked) categoriesToShow.push({ id: 2, name: 'Рестораны' });
        if (category3Checkbox.checked) categoriesToShow.push({ id: 3, name: 'Интересные места' });

        showMarkersByCategories(categoriesToShow, places);
    }

    // Пример загрузки данных с сервера при загрузке страницы
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            const response = await fetch('http://localhost:3000/places');
            const places = await response.json();

            // Показываем все маркеры по умолчанию
            updateMarkers();

            // Добавляем маркеры на карту
            places.forEach(place => {
                const placemark = new ymaps.Placemark(place.coordinates, {
                    hintContent: place.name,
                    balloonContentHeader: place.name,
                    balloonContentBody: `
                    <div>
                        <p><strong>Описание:</strong> ${place.description}</p>
                        <p><strong>Категории:</strong> ${place.categories.map(cat => cat.name).join(', ')}</p>
                    </div>
                `
                });

                map.geoObjects.add(placemark);

                placemark.events.add('click', function (e) {
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

                    showReviewForm(place);
                    updateReviewsUI(place);
                    playAudioGuide(place);
                });
            });
        } catch (error) {
            console.error('Error fetching or displaying places:', error);
        }
    });

    // Функция для отображения маркеров на карте в зависимости от выбранных категорий
    function showMarkersByCategories(categoriesToShow, places) {
        try {
            // Очищаем карту от предыдущих маркеров
            map.geoObjects.removeAll();

            // Фильтруем места по выбранным категориям и добавляем маркеры на карту
            places.forEach(place => {
                if (categoriesToShow.some(category => place.categories.some(cat => cat.id === category.id))) {
                    const placemark = new ymaps.Placemark(place.coordinates, {
                        hintContent: place.name,
                        balloonContentHeader: place.name,
                        balloonContentBody: `
                        <div>
                            <p><strong>Описание:</strong> ${place.description}</p>
                            <p><strong>Категории:</strong> ${place.categories.map(cat => cat.name).join(', ')}</p>
                        </div>
                    `
                    });

                    map.geoObjects.add(placemark);

                    placemark.events.add('click', function (e) {
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

                        showReviewForm(place);
                        updateReviewsUI(place);
                        playAudioGuide(place);
                    });
                }
            });
        } catch (error) {
            console.error('Error displaying places:', error);
        }
    }

    function updateVisitHistory() {

        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

        visitHistory.forEach(visit => {
            const li = document.createElement('li');
            li.textContent = `Место: ${visit.name} - Дата посещения: ${new Date(visit.date).toLocaleString()}`;
            historyList.appendChild(li);
        });
    }

    function addToVisitHistory(placeName) {
        const visit = {
            name: placeName,
            // date: now.toLocaleString() 
            date: new Date().getTime() // Дата посещения в формате Unix timestamp
        };
        visitHistory.push(visit);
        localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
        updateVisitHistory();
    }


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


    function calculateAverageRatingAll() {
        if (reviews.length === 0) {
            return 0; // Return 0 if there are no reviews
        }

        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += place.reviews.rating;
            console.log(review.rating)
        });

        const averageRating = totalRating / place.reviews.length;
        return averageRating.toFixed(1); // Return average rating rounded to 1 decimal place
    }

    // Функция для обновления среднего рейтинга места
    function updateAverageRating(place) {
        // Получаем массив отзывов для данного места из объекта place
        const reviews = place.reviews;

        // Инициализируем переменную для хранения суммы рейтингов
        let totalRating = 0;

        // Считаем общую сумму рейтингов
        reviews.forEach(review => {
            totalRating += review.rating;
        });

        // Вычисляем средний рейтинг
        const averageRating = totalRating / reviews.length;
        console.log('averageRating', averageRating)
        // Находим элемент на странице, куда будем выводить средний рейтинг
        const averageRatingElement = document.getElementById('average-rating-all');

        // Выводим информацию о среднем рейтинге на страницу
        averageRatingElement.textContent = `Средний рейтинг для места  ${averageRating.toFixed(1)}`;
    }




    function addReview(place) {
        const author = document.getElementById('reviewAuthor').value;
        const text = document.getElementById('reviewText').value;
        const rating = parseInt(document.getElementById('reviewRating').value);

        place.reviews.push({ author: author, text: text, rating: rating });

        updateReviewsUI(place);
        updateAverageRating(place);

        // Очистка полей формы после добавления отзыва
        document.getElementById('reviewAuthor').value = '';
        document.getElementById('reviewText').value = '';
        document.getElementById('reviewRating').value = '1';
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

    function updateReviewsUI(place) {
        const reviewsContainer = document.createElement('div');
        reviewsContainer.innerHTML = '<h3>Отзывы</h3>';

        place.reviews.forEach((review, index) => {
            const reviewDiv = document.createElement('div');
            reviewDiv.id = 'mydiv';
            reviewDiv.innerHTML = `
            <p>Автор: ${review.author} , звезд: ${review.rating} </p>
            <p>Отзыв: ${review.text}</p>
            <button onclick="deleteReview(${index}, ${place.id})">Delete</button>
        `;
            reviewsContainer.appendChild(reviewDiv);
        });

        const existingReviews = document.getElementById('existingReviews');
        if (existingReviews) {
            existingReviews.parentNode.removeChild(existingReviews);
        }

        reviewsContainer.id = 'existingReviews';
        document.getElementById('reviewFormContainer').appendChild(reviewsContainer);
    }


    function updatePhotosUI(place) {
        const photosContainer = document.getElementById('photosContainer');
        photosContainer.innerHTML = '';

        place.photos.forEach(photoData => {
            const img = document.createElement('img');
            img.src = photoData;
            img.alt = 'Фото места';
            photosContainer.appendChild(img);
        });
    }



    function playAudioGuide(place) {
        const audioPlayerContainer = document.getElementById('audioPlayerContainer');
        const audioPlayer = document.getElementById('audioPlayer');
        const audioSource = document.getElementById('audioSource');

        if (place.audio) {
            audioSource.src = place.audio;
            audioPlayer.load();
            audioPlayer.pause();
            audioPlayerContainer.classList.add('show');
        } else {
            audioPlayerContainer.classList.remove('show');
        }
    }



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
            loadVisitHistory()
            console.log('distance', distance)
            if (distance <= 1915567) { // Проверяем, находится ли пользователь в радиусе 1000 метров от места
                alert(`Вы находитесь рядом с ${place.name} (${distance.toFixed()} метров)`);
                playAudioGuide(place);
                // Здесь можно выполнить дополнительные действия для мест, которые находятся "рядом"
            }
        });
    }, function (error) {
        // В случае ошибки выводим ее текст
        alert('Ошибка при определении местоположения: ' + error.message);
    });

}


// Отображение информации об объекте
function displayPlaceInfo(point) {
    const descriptionElement = document.getElementById('description');
    const historyElement = document.getElementById('history');
    const audioGuide = document.getElementById('audioGuide');

    document.getElementById('placeNameInput').value = point.name;
    descriptionElement.textContent = point.description || 'Описание места недоступно.';
    historyElement.textContent = point.history || 'История места недоступна.';
    audioGuide.src = point.audio || '';
    if (audioGuide.src) {
        audioGuide.play();
    }

    document.getElementById('reviews-container').style.display = 'block';
    currentPlaceName = point.name;
    displayReviews();

    // Добавим проверку на наличие посещения
    checkVisitedStatus(point.name);
}

function checkVisitedStatus(placeName) {
    const historyList = document.getElementById('historyList');
    const visitEntries = historyList.querySelectorAll('li');

    visitEntries.forEach(entry => {
        if (entry.textContent.includes(placeName)) {
            // Добавить какое-то действие, например, изменение стилей или другие манипуляции
            entry.classList.add('visited');
        }
    });
}

function addPointsOfInterest() {
    pointsOfInterest.forEach(point => {
        const placemark = new ymaps.Placemark(point.coordinates, {
            hintContent: point.name
        }, {
            preset: 'islands#greenDotIcon'
        });
        placemark.events.add('click', function () {
            displayPlaceInfo(point);
        });
        map.geoObjects.add(placemark);
    });
}

// Функция для добавления нового события
function addEvent() {
    const eventNameInput = document.getElementById('eventNameInput');
    const eventDateInput = document.getElementById('eventDateInput');

    const eventName = eventNameInput.value.trim();
    const eventDate = eventDateInput.value;

    if (!eventName || !eventDate) {
        alert('Пожалуйста, заполните все поля для добавления события.');
        return;
    }

    const newEvent = {
        name: eventName,
        date: new Date(eventDate)
    };

    // Очищаем значения полей ввода
    eventNameInput.value = '';
    eventDateInput.value = '';

    events.push(newEvent);
    displayEvents();
}


// Функция для отображения списка событий
function displayEvents() {
    const eventsList = document.getElementById('events');
    eventsList.innerHTML = '';

    events.forEach((event, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${event.name} - ${event.date.toLocaleString()}`;

        const addToScheduleButton = document.createElement('button');
        addToScheduleButton.textContent = 'Добавить в расписание';
        addToScheduleButton.addEventListener('click', () => addToSchedule(index));
        listItem.appendChild(addToScheduleButton);

        const editEventButton = document.createElement('button');
        editEventButton.textContent = 'Редактировать';
        editEventButton.addEventListener('click', () => editEvent(index));
        listItem.appendChild(editEventButton);

        const deleteEventButton = document.createElement('button');
        deleteEventButton.textContent = 'Удалить';
        deleteEventButton.addEventListener('click', () => deleteEvent(index));
        listItem.appendChild(deleteEventButton);

        eventsList.appendChild(listItem);
    });
}
function addReview(place) {
    // Получаем данные из формы
    const author = document.getElementById('reviewAuthor').value;
    const text = document.getElementById('reviewText').value;
    const rating = parseInt(document.getElementById('reviewRating').value);

    // Генерируем уникальный идентификатор для отзыва
    const reviewId = generateUniqueId(); // Реализация функции generateUniqueId() зависит от ваших предпочтений

    // Создаем объект отзыва
    const newReview = {
        id: reviewId,
        author: author,
        text: text,
        rating: rating
    };

    // Добавляем новый отзыв в массив отзывов места
    place.reviews.push(newReview);

    // Обновляем интерфейс отзывов
    updateReviewsUI(place);

    // Обновляем средний рейтинг места
    updateAverageRating(place);

    // Очищаем поля формы после добавления отзыва
    document.getElementById('reviewAuthor').value = '';
    document.getElementById('reviewText').value = '';
    document.getElementById('reviewRating').value = '1';  // Предполагается, что это значение по умолчанию
}

window.deleteReview = function (index, place) {
    // Находим родительский элемент, откуда нужно удалить элемент по индексу
    let parentElement = document.getElementById('mydiv'); // Замените 'parentContainer' на актуальный ID вашего родительского контейнера
    console.log('place', place)
    parentElement.remove(index);
    updateReviewsUI(place);
    // Удаляем элемент по индексу

};


// Функция для редактирования события
function editEvent(index) {
    const eventToEdit = events[index];
    const eventNameInput = document.getElementById('eventNameInput');
    const eventDateInput = document.getElementById('eventDateInput');

    // Заполнить поля формы данными выбранного события
    eventNameInput.value = eventToEdit.name;
    eventDateInput.value = eventToEdit.date.toISOString().slice(0, 16);

    // Обновить событие после редактирования
    document.getElementById('addEventButton').textContent = 'Сохранить изменения';
    document.getElementById('addEventButton').onclick = () => updateEvent(index);
}

// Функция для обновления события
function updateEvent(index) {
    const eventNameInput = document.getElementById('eventNameInput').value.trim();
    const eventDateInput = document.getElementById('eventDateInput').value;

    if (!eventNameInput || !eventDateInput) {
        alert('Пожалуйста, заполните все поля для сохранения изменений.');
        return;
    }

    events[index].name = eventNameInput;
    events[index].date = new Date(eventDateInput);

    // Очистить форму и вернуть кнопку в исходное состояние
    document.getElementById('eventNameInput').value = '';
    document.getElementById('eventDateInput').value = '';
    document.getElementById('addEventButton').textContent = 'Добавить событие';
    document.getElementById('addEventButton').onclick = addEvent;

    displayEvents();
}

// Функция для удаления события
function deleteEvent(index) {
    events.splice(index, 1);
    displayEvents();
}



// Функция для добавления события в расписание
function addToSchedule(index) {
    const eventToAdd = events[index];
    const scheduleList = document.getElementById('scheduleList');

    const listItem = document.createElement('li');
    listItem.textContent = `${eventToAdd.name} - ${eventToAdd.date.toLocaleString()}`;

    const removeFromScheduleButton = document.createElement('button');
    removeFromScheduleButton.textContent = 'Удалить из расписания';
    removeFromScheduleButton.addEventListener('click', () => removeFromSchedule(listItem));
    listItem.appendChild(removeFromScheduleButton);

    scheduleList.appendChild(listItem);
}

// Функция для удаления события из расписания
function removeFromSchedule(item) {
    item.remove();
}

// Сохранение предпочтений пользователя
function saveUserPreferences() {

    const category = document.getElementById('poiCategory').value;
    localStorage.setItem('userPreferences', JSON.stringify({ category }));
}

function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        document.getElementById('poiCategory').value = preferences.category;
    }
}

document.getElementById('poiCategory').addEventListener('change', saveUserPreferences);
document.addEventListener('DOMContentLoaded', loadUserPreferences);

// Сохранение истории посещений

function saveVisitHistory(placeName) {
    let visitHistory = JSON.parse(localStorage.getItem('visitHistory')) || [];
    const visitEntry = {
        place: placeName,
        date: new Date().toISOString()
    };
    visitHistory.push(visitEntry);
    localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
}

document.addEventListener('DOMContentLoaded', loadVisitHistory);

function loadVisitHistory() {
    const savedHistory = localStorage.getItem('visitHistory');
    console.log('1111')
    if (savedHistory) {
        const visitHistory = JSON.parse(savedHistory);
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        visitHistory.forEach((visit) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Место: ${visit.name} - Дата посещения: ${new Date(visit.date).toLocaleString()}`;
            historyList.appendChild(listItem);

            // // Добавим проверку текущего места с местом из истории
            // if (visit.place === currentPlaceName) {
            //     listItem.classList.add('visited'); // Добавляем класс для стилизации или других действий
            // }
        });
    }
}





// Функция для отметки места как посещенного
document.addEventListener('DOMContentLoaded', function () {
    const markVisitedButton = document.getElementById('markVisitedButton');
    markVisitedButton.addEventListener('click', function () {
        const placeName = document.getElementById('placeName').textContent; // Corrected to placeName
        markVisited(placeName);
    });
});

function addToHistoryList(visitEntry) {
    const historyList = document.getElementById('historyList');
    const listItem = document.createElement('li');
    listItem.textContent = `Место: ${visitEntry.place} - Дата посещения: ${new Date(visitEntry.date).toLocaleString()}`;
    historyList.appendChild(listItem);
}
// Обработчик клика по кнопке отметки посещения
const markVisitedButton = document.getElementById('markVisitedButton');
markVisitedButton.addEventListener('click', function () {
    const placeName = document.getElementById('placeNameInput').value; // Получаем название места
    markVisited(placeName);
});

