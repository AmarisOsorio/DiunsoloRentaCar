//Controller
const logoutController = {};

//Logout
logoutController.logout = async (req, res) => {

  //Clear cookie
  res.clearCookie("authToken");

  //OK
  return res.status(200).json({ message: "Se cerró sesión" });
};

//Export
export default logoutController;
