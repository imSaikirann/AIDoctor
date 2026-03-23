import jwt from "jsonwebtoken";
export const requireAuth = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
export const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user?.role !== role) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        next();
    };
};
