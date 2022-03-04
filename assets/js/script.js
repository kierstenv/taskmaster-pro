var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const auditTask = (taskEl) => {
  const date = $(taskEl).find("span").text().trim();

  const time = moment(date, "L").set("hour", 17);
  
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// date picker
$("#modalDueDate").datepicker({
  minDate: 1
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// edit task d8s
$(".list-group").on("click", "span", function() {
  const date = $(this).text().trim();

  const dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);

  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      $(this).trigger("change");
    }
  });

  dateInput.select();
});

$(".list-group").on("change", "input[type='text']", function() {
  const date = $(this).val().trim();

  const status = $(this).closest(".list-group").attr("id").replace("list-", "");
  const index = $(this).closest(".list-group-item").index();

  tasks[status][index].date = date;
  saveTasks();

  const taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  $(this).replaceWith(taskSpan);

  auditTask($(taskSpan).closest(".list-group-item"));
});

// edit task descr
$(".list-group").on("click", "p", function() {
  const text = $(this).text().trim();

  const textInput = $("<textarea>").addClass("form-control").val(text);

  $(this).replaceWith(textInput);

  textInput.select();
});

$(".list-group").on("blur", "textarea", function() {
  const text = $(this).val().trim();
  
  const status = $(this).closest(".list-group").attr("id").replace("list-", "");
  const index = $(this).closest(".list-group-item").index();

  tasks[status][index].text = text;
  saveTasks();

  const taskP = $("<p>").addClass("m-1").text(text);
  $(this).replaceWith(taskP);
});

// drag tasks 2 edit
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",

  update: function(event) {
    const tempArr = [];
    
    $(this).children().each(function() {
      const text = $(this).find("p").text().trim();

      const date = $(this).find("span").text().trim();

      tempArr.push({
        text: text,
        date: date
      });
    });
    
    const arrName = $(this)
    .attr("id")
    .replace("list-", "");

    tasks[arrName] = tempArr;
    saveTasks();
  }
});

//drop 2 remove tasks
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
});

// remove tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();