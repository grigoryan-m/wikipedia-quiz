"use strict";

// Define the Wikipedia API URL to request a random article
const apiUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&list=random&rnnamespace=0&rnlimit=1&utf8=1&origin=*";

// Function to replace occurrences of the page title with "???" in the content
function replaceTitleWithQuestionMarks(title, content) {
    // Разбиваем строку title на массив слов и преобразуем их к нижнему регистру
    // Разбиваем строку title на массив слов
  const titleWords = title.split(/\s+/);

  // Создаем регулярное выражение для поиска слов из title в content
  const regex = new RegExp(`\\b(${titleWords.map(word => escapeRegExp(word)).join('|')})\\b`, 'gi');

  // Удаляем найденные слова из content
  const cleanedContent = content.replace(regex, '???');

  return cleanedContent;
  }
  
  // Функция для экранирования специальных символов в строке
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  

// Send a request to the Wikipedia API to get a random article title
document.addEventListener("DOMContentLoaded", ()=>{
    const guessTitle = document.getElementById("guessTitle");
    const content = document.getElementById("content");
    const articleLengthInput = document.getElementById("nextArticleLength");
    const articleLength = document.getElementById("articleLength");
    const doneButton = document.getElementById("doneButton");

    
    articleLength.innerText = articleLengthInput.value;
    articleLengthInput.addEventListener("input", ()=>{
        articleLength.innerText = articleLengthInput.value;
    });

    fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
        // Extract the title of the random article
        const randomArticleTitle = data.query.random[0].title;

        // Create a new API URL to request the content of the random article
        const randomArticleContentUrl = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exlimit=max&explaintext&titles=${encodeURIComponent(
        randomArticleTitle
        )}&origin=*`;

        // Send a request to the Wikipedia API to get the content of the random article
        return fetch(randomArticleContentUrl);
    })
    .then((response) => response.json())
    .then((data) => {
        // Extract the page content
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0]; // Get the first (and only) page ID
        const page = pages[pageId];

        // Extract and display the page title and content
        const pageTitle = page.title;
        const pageContent = page.extract.substring(0, articleLengthInput.value); // Display the first 200 characters

        const pageTitleArray = pageTitle.split(" ");
        guessTitle.placeholder = '';
        pageTitleArray.forEach(word => {
            for(let i = 0; i < word.length; i++){
                guessTitle.placeholder += "*";
            }
            guessTitle.placeholder += " ";
        });
        // Replace occurrences of the title with "???" in the content
        const replacedContent = replaceTitleWithQuestionMarks(pageTitle, pageContent);

        content.innerHTML = "<strong><i>The page content is:</i></strong> " + replacedContent;
        doneButton.addEventListener("click",()=>{
            if(guessTitle.value === pageTitle){
                alert("You won!");
            }else{
                alert(`You are wrong :(\nCorrect answer was: ${pageTitle}`);
            }
            guessTitle.value = '';
            location.reload();
        });
        document.addEventListener("keydown", (event)=>{
            if(event.keyCode === 13){
                event.preventDefault();
                if(guessTitle.value === pageTitle){
                    alert("You won!");
                }else{
                    alert(`You are wrong :(\nCorrect answer was: ${pageTitle}`);
                }
                guessTitle.value = '';
                location.reload();
            }
        });
    })
    .catch((error) => {
        console.error("An error occurred while fetching Wikipedia content:", error);
    });
});