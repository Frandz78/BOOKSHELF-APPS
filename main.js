const myBooks = [];
const RENDER_EVENT = "render-book";

// Ketika halaman sudah selesai dimuat atau tampil dengan baik
document.addEventListener("DOMContentLoaded", function () {
  const formNewBook = document.getElementById("bookForm");

  // Ketika formulir dikirim
  formNewBook.addEventListener("submit", function (event) {
    // Mencegah agar halaman tidak dimuat ulang
    event.preventDefault();

    // Tambahkan buku
    addBook();
  });

  // form pencarian buku
  const formSearchBook = document.getElementById("searchBook");

  // Ketika form pencarian diinput
  formSearchBook.addEventListener("input", function (event) {
    // Mendapatkan nilai input search dan mengubah nilai input menjadi huruf kecil
    const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

    // Memanggil fungsi untuk mem-filter buku yang ingin dicari
    searchBook(searchTitle);
  });

  // Ketika tombol pada form pencarian dikirim
  formSearchBook.addEventListener("submit", function (event) {
    // Mencegah agar halaman tidak dimuat ulang
    event.preventDefault();

    // Mendapatkan nilai input search dan mengubah nilai input menjadi huruf kecil
    const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();

    // Memanggil fungsi untuk mem-filter buku yang ingin dicari
    searchBook(searchTitle);
  });

  // Tombol edit
  const editBookForm = document.getElementById("editBookForm");

  // Ketika form edit buku dikirim
  editBookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Mengambil nilai dari input edit form
    const editedBookId = document.getElementById("editBookId").value;
    const editedTitle = document.getElementById("editBookTitle").value;
    const editedAuthor = document.getElementById("editBookAuthor").value;
    const editedYear = parseInt(document.getElementById("editBookYear").value, 10);
    const editedIsComplete = document.getElementById("editBookIsComplete").checked;

    // Menemukan buku yang akan diedit berdasarkan ID
    const editedBook = findBook(editedBookId);

    // Jika buku tidak ditemukan, keluar dari fungsi
    if (!editedBook) return;

    // Memperbarui nilai buku
    editedBook.title = editedTitle;
    editedBook.author = editedAuthor;
    editedBook.year = editedYear;
    editedBook.isComplete = editedIsComplete;

    // Menyembunyikan form edit setelah disimpan
    document.getElementById("editBookSection").style.display = "none";

    // Memperbarui tampilan data
    document.dispatchEvent(new Event(RENDER_EVENT));

    // Menyimpan data ke local storage
    saveData();
  });

  // Mengecek apakah storage di dukung oleh browser
  if (isStorageExist()) {
    // Jika iya jalankan fungsi
    loadDataFromStorage();
  }
});

function addBook() {
  const textTitle = document.getElementById("bookFormTitle").value;
  const textAuthor = document.getElementById("bookFormAuthor").value;
  const textYear = parseInt(document.getElementById("bookFormYear").value, 10);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generatedId();
  const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isComplete);

  // Menyimpan bookObject pada array myBooks
  myBooks.push(bookObject);

  // Perbarui data yang ditampilkan
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Simpan data ke local storage
  saveData();
}

function generatedId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    // Konversi tipe data string jadi number dengan bilangan desimal
    year: parseInt(year, 10),
    isComplete,
  };
}

// Costum event untuk memperbarui tampilan data
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById("incompleteBookList");
  const completeBookshelfList = document.getElementById("completeBookList");

  // Membersihkan konten sebelum di perbarui
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const bookItem of myBooks) {
    const bookElement = makeBook(bookItem);

    // Cek apakah bookItem belum selesai dibaca
    if (!bookItem.isComplete) {
      // tambahkan ke element incompleteBookshelfList
      incompleteBookshelfList.append(bookElement);
    }
    // Jika bookItem selesai dibaca
    else {
      // tambahkan ke element completeBookshelfList
      completeBookshelfList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  // Membuat tampilan data
  const textTitle = document.createElement("h3");
  textTitle.setAttribute("data-testid", "bookItemTitle");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.setAttribute("data-testid", "bookItemAuthor");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.setAttribute("data-testid", "bookItemYear");
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const container = document.createElement("div");
  container.classList.add("book_item");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");
  container.append(textTitle, textAuthor, textYear);

  const btnContainer = document.createElement("div");

  // jika buku selesai dibaca
  if (bookObject.isComplete) {
    // Tampilkan tombol belum selesai dibaca
    const incompletedBtn = document.createElement("button");
    incompletedBtn.setAttribute("data-testid", "bookItemIsCompleteButton");
    incompletedBtn.innerText = "Belum selesai dibaca";

    // Ketika tombol belum selesai dibaca di-klik
    incompletedBtn.addEventListener("click", function () {
      // Jalankan fungsi untuk mengembalikan buku ke rak belum selesai
      undoBookFromCompleted(bookObject.id);
    });

    // Masukan tombol ke element div btnContainer
    btnContainer.append(incompletedBtn);
  }
  // Jika belum selesai dibaca
  else {
    // Tampilkan tombol selesai dibaca
    const completedBtn = document.createElement("button");
    completedBtn.setAttribute("data-testid", "bookItemIsCompleteButton");
    completedBtn.innerText = "Selesai dibaca";

    // Ketika tombol selesai dibaca di-klik
    completedBtn.addEventListener("click", function () {
      // Jalankan fungsi untuk mengembalikan buku ke rak belum selesai
      addBookToCompleted(bookObject.id);
    });

    // Masukan tombol ke element div btnContainer
    btnContainer.append(completedBtn);
  }

  // Tombol Hapus buku
  const removeBtn = document.createElement("button");
  removeBtn.setAttribute("data-testid", "bookItemDeleteButton");
  removeBtn.innerText = "Hapus Buku";

  // Ketika removeBtn di-klik
  removeBtn.addEventListener("click", function () {
    // jalankan fungsi untuk menghapus buku
    removeBookFromCompleted(bookObject.id);
  });

  // Masukan tombol ke element div btnContainer
  btnContainer.append(removeBtn);

  // Tombol edit buku
  const editBtn = document.createElement("button");
  editBtn.setAttribute("data-testid", "bookItemEditButton");
  editBtn.innerText = "Edit Buku";

  // Ketika editBtn di-klik
  editBtn.addEventListener("click", function () {
    // Tampilkan Formulir untuk mengedit buku dengan memanggil fungsi showEditForm()
    showEditForm(bookObject.id);
  });

  // Masukan tombol ke element div btnContainer
  btnContainer.append(editBtn);

  // Masukan element btnContainer ke element container
  container.append(btnContainer);

  return container;
}

// Mencari id buku yang sesuai pada array myBooks
function findBook(bookId) {
  for (const bookItem of myBooks) {
    // Jika pada bookItem(array myBooks) ada id yang sama dengan bookId
    if (bookItem.id == bookId) {
      // Kembalikan nilai
      return bookItem;
    }
  }

  // Menghentikan/mengeluarkan fungsi jika perulangan sudah selesai
  return null;
}

// Fungsi untuk menampilkan form edit buku
function showEditForm(bookId) {
  const bookTarget = findBook(bookId);

  // Jika tidak ditemukan id yang sama, fungsi akan berhenti
  if (bookTarget === null) return;

  // Mengisi input dengan nilai buku yang ada
  document.getElementById("editBookId").value = bookTarget.id;
  document.getElementById("editBookTitle").value = bookTarget.title;
  document.getElementById("editBookAuthor").value = bookTarget.author;
  document.getElementById("editBookYear").value = bookTarget.year;
  document.getElementById("editBookIsComplete").checked = bookTarget.isComplete;

  // Memunculkan form edit buku
  document.getElementById("editBookSection").style.display = "block";

  // Menyimpan data ke local storage
  saveData();
}

// function showEditForm(bookId) {
//   const bookTarget = findBook(bookId);

//   if (!bookTarget) return;

//   // Mengisi nilai form edit dengan data buku yang ada
//   document.getElementById("editBookId").value = bookTarget.id;
//   document.getElementById("editBookTitle").value = bookTarget.title;
//   document.getElementById("editBookAuthor").value = bookTarget.author;
//   document.getElementById("editBookYear").value = bookTarget.year;
//   document.getElementById("editBookIsComplete").checked = bookTarget.isComplete;

//   // Menampilkan form edit
//   document.getElementById("editBookSection").style.display = "block";
// }

// Menambahkan buku ke rak selesai dibaca
function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  // Jika tidak ditemukan id yang sama, fungsi akan berhenti
  if (bookTarget === null) return;

  // Memperbarui buku dari belum selesai(false), ke selesai(true)
  bookTarget.isComplete = true;

  // Memperbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Menyimpan data ke local storage
  saveData();
}

// Mengembalikan buku dari rak selesai ke rak belum selesai
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  // Jika tidak ditemukan id yang sama, fungsi akan berhenti
  if (bookTarget === null) return;

  // Memperbarui buku dari selesai(true), ke belum selesai(false)
  bookTarget.isComplete = false;

  // Memperbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Menyimpan data ke local storage
  saveData();
}

// Fungsi untuk menghapus buku
function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  // Jika tidak ada id yang sama / sesuai, fungsi akan berhenti
  if (bookTarget === -1) return;

  // Menghapus 1 element dengan index yang sesuai dengan bookTarget
  myBooks.splice(bookTarget, 1);

  // Memperbarui tampilan data
  document.dispatchEvent(new Event(RENDER_EVENT));

  // Menyimpan data ke local storage
  saveData();
}

// Mencari id yang sama / sesuai pada array myBooks
function findBookIndex(bookId) {
  for (const index in myBooks) {
    // Jika terdapat id yang sama / sesuai
    if (myBooks[index].id == bookId) {
      // kembalikan index
      return index;
    }
  }

  // Kembalikan -1 jika tidak ada id yang sama / sesuai
  return -1;
}

// Menyimpan data ke local storage
function saveData() {
  // Mengecek apakah local storage didukung oleh browser
  if (isStorageExist()) {
    // Konversi data object javascript ke string
    const parsed = JSON.stringify(myBooks);

    // Menyimpan data ke local storage
    localStorage.setItem(STORAGE_KEY, parsed);

    // Menampilkan perubahan data
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSELF_APPS";

// Mengecek didukung tidak nya local storage
function isStorageExist() {
  // Apakah local storage tidak didukung
  if (typeof Storage === undefined) {
    // Tampilkan pesan
    alert("Browser kamu tidak mendukung local storage :(");
    // kembalikan false
    return false;
  }

  // Jika didukung kembalikan true
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  // Menampilkan data di konsol
  console.log(localStorage.getItem(STORAGE_KEY));
});

// Memuat data ketika halaman web dibuka
function loadDataFromStorage() {
  // Mengambil data dari local storage
  const dataFromStorage = localStorage.getItem(STORAGE_KEY);
  // Meng-konversi data dari string JSON menjadi object javascript
  let myData = JSON.parse(dataFromStorage);

  // Mengecek apakah data ada
  if (myData !== null) {
    // Jika ada Masukan satu per satu data ke array myBooks
    for (const book of myData) {
      myBooks.push(book);
    }
  }

  // Tampilkan perbaruan data pada halaman
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi pencarian buku
function searchBook(searchTitle) {
  const incompleteBook = document.getElementById("incompleteBookList");
  const completeBook = document.getElementById("completeBookList");

  // Mem-bersihkan rak buku
  incompleteBook.innerHTML = "";
  completeBook.innerHTML = "";

  for (const bookItem of myBooks) {
    // Mengambil judul buku lalu mengubahnya menjadi huruf kecil dan mengecek apakah judul buku sedang dicari
    const titleContainsSearch = bookItem.title.toLowerCase().includes(searchTitle);

    // Jika true
    if (titleContainsSearch) {
      const bookElement = makeBook(bookItem);

      // Jika buku belum selesai dibaca
      if (!bookItem.isComplete) {
        // Masukan ke rak belum selesai dibaca
        incompleteBook.append(bookElement);
      }
      // Jika sudah selesai dibaca
      else {
        // Masukan ke rak sudah selesai dibaca
        completeBook.append(bookElement);
      }
    }
  }
}
