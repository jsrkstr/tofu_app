class CreateTofus < ActiveRecord::Migration
  def change
    create_table :tofus do |t|
      t.string :content
      t.string :group
      t.string :priority
      t.integer :user_id
      t.string :status

      t.timestamps
    end
  end
end
