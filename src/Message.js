function Message() {
    const name="";
    if (name) {
        return <h1>HELLO {name}</h1>;
    }
    return <h1>HELLO WORLD!</h1>;
}
export default Message;