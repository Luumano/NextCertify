import Form from 'react-bootstrap/Form';
// import '../css/form-pages.css'; // Importa o CSS para garantir o estilo

function InputFlutuante({ type, id, label, value, onChange }) {
  return (
    <div className="label-float mt-3">
      <Form.Control 
        type={type} 
        id={id} 
        placeholder=" " 
        required 
        value={value}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export default InputFlutuante;