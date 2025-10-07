export function userLogout(req, res) {
  if (!req.session) {
    res.clearCookie("uow_session"); 
    return res.json({ ok: true, message: "signed_out" });
  }

  req.session.destroy(err => {
    if (err) {
      console.error("logout_error:", err);
      return res.status(500).json({ ok: false, error: "logout_failed" });
    }
    res.clearCookie("uow_session", { httpOnly: true, sameSite: "lax" }); 
    res.json({ ok: true, message: "signed_out" });
  });
}
