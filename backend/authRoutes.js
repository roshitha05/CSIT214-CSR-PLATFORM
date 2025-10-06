import { Router } from "express";
import { createUser } from "./createUser.js";
import { userLogin } from "./userLogin.js";
import { userLogout } from "./userLogout.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", userLogin);
router.post("/logout", userLogout);

export default router;
