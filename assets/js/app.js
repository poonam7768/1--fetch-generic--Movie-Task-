
const cl = console.log ;

const moviecontainer = document.getElementById('moviecontainer')
const addmoviesbtn = document.getElementById('addmoviebtn')
const backdrop = document.getElementById('backdrop')
const movieform = document.getElementById('movieform')
const closeformbtn = document.getElementById('closeform')
const movieAddbtn = document.getElementById('movieAddbtn')
const movieName= document.getElementById('movieName')
const movieImg = document.getElementById('movieImg')
const movieDiscription = document.getElementById('moviediscription')
const movieRating = document.getElementById('movieRating')
const submitMovieBtn = document.getElementById('movieAddbtn')
const updateMoviebtn = document.getElementById('updateMoviebtn')
const spinner = document.getElementById('spinner')

const BASE_URL = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const MOVIES_URL = `${BASE_URL}movies.json`

const state = {
    MoviesArr : [],
    editMovieId : null,
}

function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        state.MoviesArr.unshift(obj[key])
    }
}
function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

function setRating(rating){
    if(rating > 4){
        return "badge-success";
    }else if(rating <= 4 && rating > 3){
        return "badge-warning";
    }else{
        return "badge-danger";
    }
}

function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        timer:3000,
        icon:icon,
    })
}


function onMovieformToggel(){
    backdrop.classList.toggle("active")
    movieform.classList.toggle("active")
   movieform.reset()
}

function makeApiCall(url,methodName,body=null){
    
    return fetch (url,{
        method:methodName,
        headers: {
            "content-type":"application/json",
            "auth":"JWT token"
        },
        body:body ? JSON.stringify(body) : null
    })
    .then(res =>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
}

//Read

function oncreate(){
    handleSpinner(true)
    makeApiCall(MOVIES_URL,"GET")
     .then(data=>{
        cl(data)
        objToArr(data)
        templiting(state.MoviesArr)
     })
     .catch(err=>{
        snackBar("something went wrong","error")
     })
     .finally(()=>{
        handleSpinner()
     })
}
    

function templiting(arr){
    let result = ``
    arr.forEach((movie)=>{
        result +=`
            <div class="col-md-3 mb-4" id="${movie.id}">
<div class="card moviecard">
    <div class="card-header d-flex justify-content-between">
    <h4 class="movieTitle">${movie.name}</h4>
    <h5><span class="badge ${setRating(movie.rating)}">${movie.rating}</span></h5>
    </div>
<div class="card-body">
    <figure class="py-0">
        <img src="${movie.img}">
        <figcaption>
            <h5>${movie.name}</h5>
            <p>${movie.discription}</p>
        </figcaption>
    </figure>
</div>
<div class="card-footer d-flex justify-content-between">
    <button onclick="onEdit(this)" class="btn btn-sm net-sec-btn">Edit</button>
    <button onclick="onRemove(this)" class="btn btn-sm net-primary-btn">Delete</button>
</div>
</div>
</div>
`
    })
    moviecontainer.innerHTML = result;

}
oncreate()



addmoviesbtn.addEventListener("click", onMovieformToggel);
closeformbtn.addEventListener("click", onMovieformToggel);
backdrop.addEventListener("click", onMovieformToggel);
//create..

function onAddMovies(eve){
    eve.preventDefault()
    let new_movieObj ={
        name:movieName.value,
        img:movieImg.value,
        discription:movieDiscription.value,
        rating:movieRating.value,
    }
    handleSpinner(true)
    makeApiCall(MOVIES_URL,"POST",new_movieObj)
      .then(res=>{
        cl(res)
        new_movieObj.id = res.name
        state.MoviesArr.unshift(new_movieObj)
        
        let col = document.createElement('div')
        col.className = `col-md-3 mb-4`;
        col.id = new_movieObj.id;
        col.innerHTML = `

        <div class="card moviecard">
        <div class="card-header d-flex justify-content-between">
       <h4 class="movieTitle">${new_movieObj.name}</h4>
       <h5><span class="badge ${setRating(new_movieObj.rating)}">${new_movieObj.rating}</span></h5>
       </div>
       <div class="card-body">
       <figure class="py-0">
        <img src="${new_movieObj.img}">
        <figcaption>
            <h5>${new_movieObj.name}</h5>
            <p>${new_movieObj.discription}</p>
        </figcaption>
       </figure>
       </div>
       <div class="card-footer d-flex justify-content-between">
     <button onclick="onEdit(this)" class="btn btn-sm net-sec-btn">Edit</button>
     <button onclick="onRemove(this)" class="btn btn-sm net-primary-btn">Delete</button>
     </div>
     </div>
                        `;
         moviecontainer.prepend(col)
         snackBar(`new movie added successfully!!`,'success')
      })
      .catch(err => {
        snackBar(err,'error')
      })
      .finally(()=>{
        handleSpinner()
      })

}



//edit..

function onEdit(ele){
    let editId = ele.closest('.col-md-3').id
    state.editMovieId = editId
    let editObj = state.MoviesArr.find(m => m.id === editId)

    
    movieName.value = editObj.name,
    movieImg.value = editObj.img,
    movieDiscription.value = editObj.discription,
    movieRating.value = editObj.rating,

    movieAddbtn.classList.add('d-none')
    updateMoviebtn.classList.remove('d-none')

    movieform.classList.add('active')
    backdrop.classList.add('active')
 
}

//update....
function onUpdateMovie(){
    //updateId 
    let updateId = state.editMovieId;
    //updateUrl
    let updateUrl = `${BASE_URL}movies/${updateId}.json`
    //updateObj
    let old_obj = state.MoviesArr.find(m => m.id === state.editMovieId)
    let updatedObj ={
        name :movieName.value,
        img:movieImg.value,
        discription:movieDiscription.value,
        rating:movieRating.value,
        id:updateId
    }
    handleSpinner(true)
    makeApiCall(updateUrl,"PATCH",updatedObj)
    .then(res =>{
        //update local state(with id)
        let getIndex = state.MoviesArr.findIndex(m=> m.id === updateId)
        state.editMovieId = null;
        state.MoviesArr[getIndex] = updatedObj;
        //update card on ui
        let col = document.getElementById(updateId)
        col.innerHTML = `

    <div class="card moviecard">
    <div class="card-header d-flex justify-content-between">
    <h4 class="movieTitle">${updatedObj.name}</h4>
    <h5><span class="badge ${setRating(updatedObj.rating)}">${updatedObj.rating}</span></h5>
    </div>
<div class="card-body">
    <figure class="py-0">
        <img src="${updatedObj.img}">
        <figcaption>
            <h5>${updatedObj.name}</h5>
            <p>${updatedObj.discription}</p>
        </figcaption>
    </figure>
</div>
<div class="card-footer d-flex justify-content-between">
    <button onclick="onEdit(this)" class="btn btn-sm net-sec-btn">Edit</button>
    <button onclick="onRemove(this)" class="btn btn-sm net-primary-btn">Delete</button>
</div>
</div>`

// hide update and show add btn
updateMoviebtn.classList.add('d-none')
movieAddbtn.classList.remove('d-none')

onMovieformToggel()
snackBar(`Movie Updated Successfully !!!`,'success')
    })
    .catch(err =>{
        snackBar(err,"error")
    })
    .finally(() => {
        handleSpinner()
    })

}

//Delete....

function onRemove(ele){
    let removeId = ele.closest('.col-md-3').id

    Swal.fire({
  title: "Are you sure?",
  icon: "warning",
  showCancelButton: true,
  
  confirmButtonText: "Yes, Remove it!"
}).then((result) => {
  if (result.isConfirmed) {
    handleSpinner(true)
    let removeUrl = `${BASE_URL}movies/${removeId}.json`;
    makeApiCall(removeUrl,"DELETE")
    .then(res => {
        let getIndex = state.MoviesArr.findIndex(m=>m.id === removeId)
        state.MoviesArr.splice(getIndex,1)
        ele.closest('.col-md-3').remove()
        snackBar(`The movie is removed successfully !!`,'success')
    })
    .catch(err =>{
        snackBar(err,'error')
    })
    .finally(()=>{
        handleSpinner()
    })
  }
});

}






movieform.addEventListener("submit",onAddMovies)
updateMoviebtn.addEventListener("click",onUpdateMovie)



