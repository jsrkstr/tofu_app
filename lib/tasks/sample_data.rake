namespace :db do
  desc "Fill database with sample data"
  task populate: :environment do
    make_users
    make_microposts
    make_relationships
  end
end

def make_users

  sachin = User.create!(name: "Sachin",
                 email: "sachin.saluja132@gmail.com",
                 password: "asdfgh",
                 password_confirmation: "asdfgh")

  maku = User.create!(name: "Maku",
                 email: "maku@makuchaku.in",
                 password: "asdfgh",
                 password_confirmation: "asdfgh")
  
  sachin.toggle!(:admin)

  admin = User.create!(name:     "Example User",
                       email:    "example@railstutorial.org",
                       password: "foobar",
                       password_confirmation: "foobar")
  
  20.times do |n|
    name  = Faker::Name.name
    name = name.split(" ").join()
    email = "example-#{n+1}@gmail.org"
    password  = "password"
    user = User.create!(name:     name,
                 email:    email,
                 password: password,
                 password_confirmation: password)
    user.connect(1)
    user.connect(2)
  end


  (3..13).each { |n|
    sachin.connect(n)
    maku.connect(n)
  }

end


def make_microposts
  users = User.all(limit: 6)
  50.times do
    content = Faker::Lorem.sentence(5)
    users.each { |user| user.microposts.create!(content: content) }
  end
end

def make_relationships
  users = User.all
  user  = users.first
  followed_users = users[2..50]
  followers      = users[3..40]
  followed_users.each { |followed| user.follow!(followed) }
  followers.each      { |follower| follower.follow!(user) }
end