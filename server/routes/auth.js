const router = require("express").Router();

const {
    login,
    register,
    getAllUsers,
    setAvatar,
    // logOut,
} = require("../controllers/userController");

router.post("/register",register);
router.post("/login",login);
router.post("/setAvatar/:id",setAvatar);
router.get("/allusers/:id",getAllUsers);



module.exports = router;