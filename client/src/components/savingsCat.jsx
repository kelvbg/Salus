import React from 'react';
import '../styles/savings.css'
import Card from 'react-bootstrap/Card';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';
import {MdEdit} from 'react-icons/md';
import {FiX} from 'react-icons/fi'
import axios from 'axios';
import {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import CloseButton from 'react-bootstrap/CloseButton';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import SavingsHist from './savingsHist';
import ConfirmDelete from './confirmDelete';
// import { currencyFormatter } from "./utils";

function NewGoalForm({ userID, catId, name, saved, goal}) {

  // variables in the savings table
  const [goalName, setGoalName] = useState(name);

  const [goalAmount, setGoalAmount]  = useState(goal);

  const [amountUpdate, setAmountUpdate]  = useState(0);
  const [amountContributed, setAmountContributed] = useState(saved);
  const [pos, setPos] = useState(true);


  // updates during form submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function getDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    return `${month}/${date}/${year}`;
}

  // handle form submit
  const handleSubmit = async (e) => {
    console.log("new: " + goalName + "old: " + name);
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const newSaved = parseFloat(amountContributed) + (pos ? parseFloat(amountUpdate) : -parseFloat(amountUpdate));

    const updateGoal = async (e) => {
    // request to update entry to database
      try {
        console.log(catId)
        const editedGoal = {goal_amount: goalAmount, amount_contributed: newSaved, savings_category: goalName};
        const response = await axios.put(`http://localhost:8081/api/savings/update/${catId}`, editedGoal);
        console.log(response);
        console.log("updated successfully ");

        setIsSubmitting(false);
        setSuccess('Data successfully saved!');
        console.log('Data saved: ', response.data);
      } catch (err) {
        setIsSubmitting(false);
        setError('Something went wrong! Please try again.');
        console.error(err);
      }
    };

    const addToHist = async (e) => {
    // request to add entry to database
      try {
        const newEntry = {user_id: userID, date: getDate(), amount: amountUpdate, savings_category: goalName};
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

    const editHistName = async(e) => {
      try{
        const updateEntry = {user_id: userID, new_name: goalName};
        const response = await axios.put(`http://localhost:8081/api/savingsHistory/update/${name}`, updateEntry);
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
    }

    updateGoal();
    if(amountUpdate !== 0){
      addToHist();
    };
    if(goalName !== name){
      editHistName();
    }

    //need to make a request to post to SavingsHistory (only if newSaved != amount_contributed)
  };

  // Function to set 'pos' to true
  const setPosToTrue = () => {
    setPos(true);
  };

  // Function to set 'pos' to false
  const setPosToFalse = () => {
    setPos(false);
  };


  const calculateTotal = () => {
    const amount = parseFloat(amountContributed) + (pos ? parseFloat(amountUpdate) : -parseFloat(amountUpdate));
    if (amount < 0) {
      return 0;
    }
    return amount;
  }
  
  return (
   <Form className = "form">
      {/* input for the goal name */}
      <Form.Group className="mb-3" controlId="formGoalName">
        <Form.Label>Goal Name</Form.Label>
        <Form.Control className = "input" type="string"
         value={goalName}
         onChange = {(e) => setGoalName(e.target.value)}    
        />
      </Form.Group>

      {/* input for the goal amount  */}
      <Form.Group className="mb-3" controlId="formGoalAmount" id="edit-goal-amount">
        <Form.Label>Goal Amount</Form.Label>
        <Form.Control  
         value={goalAmount}
         className = "edit-goal"
         onChange = {(e) => setGoalAmount(e.target.value)}
          />
      </Form.Group>

      {/* input for how much someone has already contributed to it */}
      <Form.Group className="mb-3" controlId="formAmountContributed" id="add-goal-text">
        <Form.Label>Amount Contributed</Form.Label>
        <Form.Control  
         value={amountContributed}
         className = "edit-curramount"
         readOnly
          />
        <ToggleButtonGroup type="radio" defaultValue={1} name="options" className="add-or-sub">
          <ToggleButton id="tbg-radio-1" value={1} onClick={setPosToTrue}>
            +
          </ToggleButton>
          <ToggleButton id="tbg-radio-2" value={2} onClick={setPosToFalse}>
            -
          </ToggleButton>
        </ToggleButtonGroup>
        <Form.Control type="number" 
         value={amountUpdate}
         onChange = {(e) => setAmountUpdate(e.target.value)}
         className = "edit-addamount"
          />
        <div id ="equals">  
           = 
        </div>   
        <Form.Control
         value={calculateTotal()}
         className = "edit-totalamount"
         readOnly
          />
      </Form.Group>

      <div className="add-button-container">
      {/* submit button  */}
      <Button id="add-goal-button" type = "submit" onClick={handleSubmit} disabled={isSubmitting}> {isSubmitting ? 'Updating Goal...' : 'Update Goal'} </Button>
      </div>
    </Form>
  );
}

//  modal for updating goal
function UpdateGoalModal(props) {
  const { show, onHide, userID,  catID, name, saved, goal } = props;
  const handleClose = () => {
    props.onHide(); // Close the modal using the onHide prop from props
  };
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className = "modal"
    >
    <Modal.Header>
      <Modal.Title id="contained-modal-title-vcenter">
          Edit Goal
        </Modal.Title>
      <CloseButton className="btn-close-white" onClick = {handleClose} style={{ color: 'white !important' }} />
      </Modal.Header>
      <Modal.Body>
        <NewGoalForm userID= {userID} catId={catID} name= {name} saved={saved} goal={goal}  />
      </Modal.Body>
    </Modal>
  );
}


function getProgressBarVariant(saved, goal) {
    const ratio = saved / goal
    if (ratio < 1) return "primary"
    return "success"
}

function SavingsCategory({ userID, catId, name, saved, goal}) {

  // format currency 
  const currencyFormatter = new Intl.NumberFormat(undefined, {
    currency: "usd",
    style: "currency",
    minimumFractionDigits: 0,
  })

  // visual changes when you have exceeded your goal
  const classNames = []
  if (saved > goal) {
        classNames.push("bg-danger", "bg-opacity-10")
  }
  
  // calculate percentage contributed toward goal
  const num = saved/goal;
  const prog = Math.round(num * 100);

  // function for deleting a category
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // show or close edit modal
  const [modalShow, setModalShow] = React.useState(false);
  // show or close savings history modal
  const [histShow, setHistShow] = React.useState(false);
  // show or close confirm delete modal 
  const[delShow, setDelShow] = React.useState(false);


  // const handleDeleteElement = (catId) => {
   
    // console.log(catId, typeof(catId))
    // try {
    //   const response = await axios.delete(`http://localhost:8081/api/savings/delete/${catId}`);

    //   if (response.status === 200) {
    //     setSuccess('Element deleted successfully');
    //   } else {
    //     setError('Element not found');
    //   }
    // } catch (err) {
    //   setError('Something went wrong! Please try again.');
    //   console.error(err);
    // }
  // };

  
  return (
    <Card style={{ width: '500rem' }}  className ="card">
        <div className="card-buttons">
              <div className = "edit">
                <Button
                className = "edit-btn"
                variant = "primary" 
                onClick={() => setModalShow(true)}> 
                <MdEdit id = "pencil"/>
                </Button>
                <UpdateGoalModal
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  userID = {userID}
                  catID = {catId}
                  name = {name}
                  saved = {saved}
                  goal = {goal}
                />
              </div>
              <div className="removeCat">
                <Button className="delete" onClick={() => setDelShow(true)}>
                  <FiX id="xdel"/>
                </Button>

              </div>
            </div>
      <button className="btnastext" onClick={() => setHistShow(true)}>
      <Card.Body>
        <Card.Title className="title">
          <div className="catName">
           {name}
          </div>
        </Card.Title>
        <ProgressBar 
          className="prog-bar-sav" 
          variant={getProgressBarVariant(saved, goal)}
          min={0}
          max={goal}
          now={saved}
          label={`${prog}%`}
          style= {{height: "25px"}}
          />
          <div className="goalAmount">
                {currencyFormatter.format(saved)}
                <span className="text-muted fs-6 ms-1">
                 / {currencyFormatter.format(goal)}
                </span>
          </div>
      </Card.Body>

    </button>
    <SavingsHist 
      show={histShow}
      onHide={() => setHistShow(false)}
      catID = {catId}
      name = {name}
      userID = {userID}/>

    <ConfirmDelete 
      show={delShow}
      onHide={() => setDelShow(false)}
      catID = {catId}>
    </ConfirmDelete>

    </Card>

  
  );
}

export default SavingsCategory;
