function login(){

  const contract = document.getElementById("contractRef").value
  const password = document.getElementById("password").value

  if(contract === "" || password === ""){

    document.getElementById("loginError").innerText = "Please enter contract reference and password"
    return

  }

  document.getElementById("loginScreen").classList.add("hidden")
  document.getElementById("chatScreen").classList.remove("hidden")

}


function logout(){

  document.getElementById("chatScreen").classList.add("hidden")
  document.getElementById("loginScreen").classList.remove("hidden")

}


function sendMessage(){

  const input = document.getElementById("messageInput")
  const message = input.value

  if(message === "") return

  const chat = document.getElementById("chatMessages")

  const userMsg = document.createElement("div")
  userMsg.className = "user-message"
  userMsg.innerText = message

  chat.appendChild(userMsg)

  input.value = ""


  setTimeout(()=>{

    const botMsg = document.createElement("div")
    botMsg.className = "bot-message"
    botMsg.innerText = "This is a demo response from the AI insurance chatbot frontend."

    chat.appendChild(botMsg)

    chat.scrollTop = chat.scrollHeight

  },500)

}
