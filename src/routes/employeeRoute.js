const express = require("express");
const router = new express.Router();
const employeeController = require("../controller/employeeController");
const auth = require("../middleware/auth");

// await cloudinary.uploader.upload(str, {})
router.get(
    "/user",
   (req,res) => {
    res.send({ message: 'user route welcome'})
   }
  );
router.post(
  "/user/register",
  employeeController.register,
);
router.post(
  "/user/update",
  auth,
  employeeController.update,
);
// router.get("user/find/tutors", userController.getTutors);
// router.delete("user/delete/:userId", auth, userController.deleteUser);

// router.get("user/find/:id", auth, userController.getUser);
router.post("/user/login", employeeController.login);
router.post("/user/logout", auth, employeeController.logout);

module.exports = router;