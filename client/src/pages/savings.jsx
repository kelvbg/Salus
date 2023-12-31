import React from 'react';
import {useState, useEffect} from 'react';
import "../styles/savings.css"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form';
import CloseButton from 'react-bootstrap/CloseButton';
import SavingsCategory from '../components/savingsCat';
import axios from 'axios';
import { AiOutlinePlus } from 'react-icons/ai';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SavingsSummary from './savingsSummary';
// import { local } from 'd3';


function NewGoalForm(props) {

  const userId = localStorage?.userId;


  // variables in the savings table
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount]  = useState('');
  const [amountContributed, setAmountContributed] = useState(0);

  // updates during form submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const token = localStorage.getItem('authToken');
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

  function getDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    return `${month}/${date}/${year}`;
}
  
  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // post request to add new entry to database 
    const addGoal = async(e) => {
    try {
      const newGoal = {user_id: userId, goal_amount: goalAmount, amount_contributed: amountContributed,
                       savings_category: goalName, date_created: getDate(), completed: 0};
      const response = await axios.post('http://localhost:8081/api/savings/insert', newGoal);
      
      setIsSubmitting(false);
      setSuccess('Data successfully saved!');
      console.log('Data saved: ', response.data);
      console.log(success);
    } catch (err) {
      setIsSubmitting(false);
      setError('Something went wrong! Please try again.');
      console.error(err);
      console.log(error);
    }}

    const addToHist = async (e) => {
    // request to add entry to database
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US');


    const showTime = date.getHours() 
        + ':' + date.getMinutes() 
        + ":" + date.getSeconds();
      try {
        const newEntry = {user_id: userId, date: formattedDate, timestamp: showTime, amount: amountContributed, savings_category: goalName, creation_date: formattedDate };
        const response = await axios.post(`http://localhost:8081/api/savingsHistory/insert`, newEntry);
        console.log(response);
        console.log("posted successfully ");

        setIsSubmitting(false);
        setSuccess('Data successfully saved!');
        console.log('Data saved: ', response.data);
      } catch (err) {
        setIsSubmitting(false);
        setError('Something went wrong! Please try again.');
        console.error(err);
      }
    };

    addGoal();
    addToHist();

    // clear fields after goal is submitted
    setGoalName('');
    setGoalAmount('');
    setAmountContributed(0);    
    console.log(props.update)
    props.setUpdate(!props.update);
    console.log(props.update)
  };

  return (
   <Form className = "form">
      {/* input for the goal name */}
      <Form.Group className="mb-3" controlId="formGoalName">
        <Form.Label>Goal Name</Form.Label>
        <Form.Control className = "input" type="string" placeholder='e.g. Vacation'
         value={goalName}
          onChange = {(e) => setGoalName(e.target.value)}
          required 
        />
      </Form.Group>

      {/* input for the goal amount  */}
      <Form.Group className="mb-3" controlId="formGoalAmount" id="add-goal-text">
        <Form.Label>Goal Amount</Form.Label>
        <Form.Control type="number" placeholder=" e.g. 2000"
         value={goalAmount}
           onChange = {(e) => setGoalAmount(e.target.value)}
           required/>
      </Form.Group>

      {/* input for how much someone has already contributed to it */}
      <Form.Group className="mb-3" controlId="formAmountContributed" id="add-goal-text">
        <Form.Label>Amount Contributed</Form.Label>
        <Form.Control type="number" placeholder=" e.g. 0"
         value={amountContributed}
           onChange = {(e) => setAmountContributed(e.target.value)}/>
      </Form.Group>

      <div className="add-button-container">
      {/* submit button  */}
      <Button id="add-goal-button" type = "submit" onClick={handleSubmit} disabled={isSubmitting}> {isSubmitting ? 'Adding Goal...' : 'Add Goal'} </Button>
      </div>
    </Form>
  );
}

//  modal for adding new goal
function NewGoalModal(props) {
  const handleClose = () => {
    props.onHide();
    console.log(props.update)
    props.setUpdate(!props.update);
  };
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className = "modal"
    >
    <Modal.Header>
      <Modal.Title id="contained-modal-title-vcenter">
          Add a New Goal
        </Modal.Title>
      <CloseButton className="btn-close-white" onClick = {handleClose} style={{ color: 'white !important' }} />
      </Modal.Header>
      <Modal.Body>
        <NewGoalForm setUpdate={props.setUpdate} update={props.update}/>
      </Modal.Body>
    </Modal>
  );
}

// main function in the page, in charge of display and combining all features
function Savings() {
  // const { currentUser } = useAuth(); 
  const userId = localStorage?.userId;

  // variable for showing or hiding modal
  const [modalShow, setModalShow] = React.useState(false);
  // variable for all goals belonging to user
  const [goals, setGoals] = React.useState([]);
  const [update, setUpdate] = useState(false);

  const sortDataByProperty = (data, property) => {
  const sorted = [...data].sort((a, b) => {
    return a[property].toLowerCase().localeCompare(b[property].toLowerCase());
  });

  return sorted;
  };

  const sortedGoals = sortDataByProperty(goals, 'savings_category');
  const completedGoals = sortedGoals.filter(goal => goal.completed === 1);
  const currGoals = sortedGoals.filter(goal => goal.completed === 0);
  // get requests to get all of the savings goals for a user
  useEffect(() => {
    axios.get('http://localhost:8081/api/savings/show/' + userId)
      .then(response => setGoals(response.data))
      .catch(err => console.log(err));
      console.log("test");
  }, [update]);
  
  return (
    <div className="all" style={{display: "flex"}}>
    <div className="Saving">
      {/* <h1 id="savings-title"> Savings </h1> */}
    
    <div className= "float-container">   
      {/* display of existing savings goals and goal progress */}
        <div className = "goals"> 
          <h3 id="goals-title">Your Saving Goals </h3>
        </div>

        <div className = "add">
        {/* button that allows user to add a new savings goal */}
        {/* <Button variant="primary" className = "button" onClick={() => setModalShow(true)}>
          +
        </Button> */}
        <AiOutlinePlus className="plusbutton" style={{ fontSize: '2rem' }} onClick={() => setModalShow(true)}/>
        {/* modal for adding new goal */}
        <NewGoalModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          setUpdate = {setUpdate}
          update = {update} 
        />
        </div>
        
      </div>


      <div className= "show-tabs">
      <Tabs
        defaultActiveKey="curr"
        id="uncontrolled-tab-example"
        className="tab-group"
        >
        <Tab eventKey="curr" title="In Progress" className="tab">

        {/* map over all goals and create individual displays */}
          <div className = 'show-categories'>
            <div className = "cats">
              {
                currGoals.map(goal =>{
                return (
                  <div key = {goal._id} className = "goaldiv"> 
                    <SavingsCategory setUpdate={setUpdate} update={update} userID = {userId} catId = {goal._id} name={goal.savings_category} saved={goal.amount_contributed} goal={goal.goal_amount} date={goal.date_created}/> 
                  </div>
                );
              })}
            </div>
          </div>
        </Tab>
        <Tab eventKey="completed" title="Completed" className="tab">
           {/* map over all goals and create individual displays */}
          <div className = 'show-categories'>
            <div className = "cats">
              {
                completedGoals.map(goal =>{
                return (
                  <div key = {goal._id} className = "goaldiv"> 
                    <SavingsCategory setUpdate={setUpdate} update={update} userID = {userId} catId = {goal._id} name={goal.savings_category} saved={goal.amount_contributed} goal={goal.goal_amount} date={goal.date_created}/> 
                  </div>
                );
              })}
            </div>
          </div>
        </Tab>
        <Tab eventKey="all" title="All" className="tab">
          {/* map over all goals and create individual displays */}
          <div className = 'show-categories'>
            <div className = "cats">
              {
                sortedGoals.map(goal =>{
                return (
                  <div key = {goal._id} className = "goaldiv"> 
                    <SavingsCategory setUpdate={setUpdate} update={update} userID = {userId} catId = {goal._id} name={goal.savings_category} saved={goal.amount_contributed} goal={goal.goal_amount} date={goal.date_created}/> 
                  </div>
                );
              })}
            </div>
          </div>
        </Tab>
      </Tabs>
      
      </div>
      </div>
      <div className="Saving" style={{background: "white", marginTop: "90px", paddingTop: "10px"}}>
          <SavingsSummary key={update}/>
      </div>
      </div>
  );
}

export default Savings;

