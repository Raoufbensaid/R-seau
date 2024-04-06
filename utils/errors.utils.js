module.exports.signUpErrors = (error) => {
  let errors = {
    pseudo: "",
    email: "",
    password: "",
  };

  if (error.message.includes("pseudo"))
    errors.pseudo = "Pseudo incorrect ou déjà pris";

  if (error.message.includes("email")) errors.email = "Email incorrect";

  if (error.message.includes("password"))
    errors.password = "Le mot de passe doit faire 6 caractèress minimums";

  if (error.code == 11000 && Object.keys(error.keyValue)[0].includes("pseudo"))
    errors.pseudo = "Cet pseudo est déjà enregistré";

  if (error.code == 11000 && Object.keys(error.keyValue)[0].includes("email"))
    errors.email = "Cet email est déjà enregistré";

  return errors;
};

module.exports.signInErrors = (error) => {
  let errors = { email: "", password: "" };

  if (error.message.includes("email")) errors.email = "Email inconnu";

  if (error.message.includes("password"))
    errors.password = "Le mot de passe ne correspoond pas";

  return errors;
};

module.exports.uploadErrors = (error) => {
  let errors = { format: "", maxSize: "" };

  if (error.message.includes("invalid file"))
    errors.format = "Format incompatabile";

  if (error.message.includes("max size"))
    errors.maxSize = "Le fichier dépasse 500ko";

  return errors;
};
