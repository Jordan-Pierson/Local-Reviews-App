from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user, login_user
from app.models import User, Review, db
from app.forms import SignUpForm

user_routes = Blueprint('users', __name__)


@user_routes.route('/', methods=['POST'])
def sign_up():
    """
    Sign Up a User - Creates a new user, logs them in as the current user, and returns the current user's information
    """
    form = SignUpForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        user = User(
            username=form.data['username'],
            email=form.data['email'],
            password=form.data['password'],
            first_name=form.data['first_name'],
            last_name=form.data['last_name']
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return {'user': user.to_dict()}, 201
    return form.errors, 400


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()


@user_routes.route('/<int:user_id>/reviews')
@login_required
def get_user_reviews(user_id):
    """
    Get all reviews by a user
    """
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User couldn't be found"}), 404
    
    # Only allow users to see their own reviews (authentication required)
    if user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403
    
    reviews = Review.query.filter(Review.user_id == user_id).all()
    
    return jsonify({
        "Reviews": [review.to_dict_with_user_business() for review in reviews]
    })
