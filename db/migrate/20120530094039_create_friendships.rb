class CreateFriendships < ActiveRecord::Migration
  def change
    create_table :friendships do |t|
      t.integer :user_id
      t.integer :friend_id
      t.boolean :approved

      t.timestamps
    end
    add_index :friendships, [:user_id, :approved]
  end
end
