import { marked } from 'marked';

    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const previewButton = document.getElementById('previewButton');
    const resetButton = document.getElementById('resetButton');
    const contentDiv = document.getElementById('content');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    let slides = [];
    let currentSlide = 0;
    const STORAGE_KEY = 'presentationContent';

    function renderSlide(index) {
      if (slides.length === 0) {
        contentDiv.innerHTML = '<p>No content available.</p>';
        return;
      }
      if (index < 0) {
        currentSlide = 0;
      } else if (index >= slides.length) {
        currentSlide = slides.length - 1;
      } else {
        currentSlide = index;
      }
      contentDiv.innerHTML = slides[currentSlide];
    }

    function parseMarkdown(text) {
      const html = marked.parse(text);
      slides = html.split('<hr>\n');
      renderSlide(0);
    }

    function loadContent() {
      const savedContent = localStorage.getItem(STORAGE_KEY);
      if (savedContent) {
        textInput.value = savedContent;
        parseMarkdown(savedContent);
      }
    }

    function saveContent(content) {
      localStorage.setItem(STORAGE_KEY, content);
    }

    function handleFileInput() {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        textInput.value = text;
        parseMarkdown(text);
        saveContent(text);
      };
      reader.readAsText(file);
    }

    function handleTextPreview() {
      const text = textInput.value;
      parseMarkdown(text);
      saveContent(text);
    }

    function handleReset() {
      textInput.value = '';
      slides = [];
      currentSlide = 0;
      contentDiv.innerHTML = '';
      localStorage.removeItem(STORAGE_KEY);
    }

    function handleNavigation(direction) {
      if (direction === 'prev') {
        renderSlide(currentSlide - 1);
      } else if (direction === 'next') {
        renderSlide(currentSlide + 1);
      }
    }

    let touchStartX = 0;
    contentDiv.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    contentDiv.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance > 50) {
        handleNavigation('prev');
      } else if (swipeDistance < -50) {
        handleNavigation('next');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        handleNavigation('prev');
      } else if (e.key === 'ArrowRight') {
        handleNavigation('next');
      }
    });

    fileInput.addEventListener('change', handleFileInput);
    previewButton.addEventListener('click', handleTextPreview);
    resetButton.addEventListener('click', handleReset);
    prevButton.addEventListener('click', () => handleNavigation('prev'));
    nextButton.addEventListener('click', () => handleNavigation('next'));

    loadContent();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/src/sw.js');
      });
    }
